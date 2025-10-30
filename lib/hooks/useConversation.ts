import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BroadCastKey,
  BroadcastPayload,
  CacheKey,
  Conversation,
  Message,
  RawMessage,
  RawUser,
  User,
} from "../types";
import { ComponentRef, useCallback, useEffect, useRef } from "react";
import { supabaseClientSide } from "../supabaseClientSide";
import { reportedMessageBodyReplacement } from "../wordings";
import { getMessageFromRaw } from "../forum/getMessageFromRaw";
import useUsers from "./useUsers";
import useConversations from "./useConversations";

export default function useConversation(conversationId: string) {
  const { conversations } = useConversations();
  const { users } = useUsers();
  const lastEmptyLiRef = useRef<ComponentRef<"li">>(null);

  const scrollToBottom = () => {
    if (!lastEmptyLiRef.current) return;
    setTimeout(() => {
      lastEmptyLiRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const queryClient = useQueryClient();
  const {
    data: conversation,
    error,
    isLoading,
  } = useQuery({
    queryKey: [`conversation-${conversationId}` satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      scrollToBottom();
      return response.json() as Promise<Conversation>;
    },
  });

  const onNewMessage = useCallback(
    ({ rawMessage }: { rawMessage: RawMessage }) => {
      const author = users.find(
        ({ id }) => parseInt(id) === rawMessage.user_id,
      ) ?? {
        id: "-1",
        pseudo: "nanani",
        bannedAt: null,
      };

      const message = getMessageFromRaw(rawMessage, {
        id: author.id,
        pseudo: author.pseudo,
        bannedAt: author.bannedAt,
      });

      queryClient.setQueryData(
        [`conversation-${conversationId}` satisfies CacheKey],
        (old: Conversation) => {
          return {
            ...old,
            messages: [
              ...old.messages.filter(({ id }) => id !== message.id),
              message,
            ],
          };
        },
      );
      scrollToBottom();
    },
    [queryClient],
  );

  const onReportedMessage = useCallback(
    ({ message }: { message: Message }) => {
      queryClient.setQueryData(
        [`conversation-${conversationId}` satisfies CacheKey],
        (old: Conversation) => {
          return {
            ...old,
            messages: [
              ...old.messages.filter(({ id }) => id !== message.id),
              message,
            ],
          };
        },
      );
      scrollToBottom;
    },
    [queryClient],
  );

  const onBannedUser = useCallback(
    ({ user }: { user: User }) => {
      for (const conversation of conversations) {
        queryClient.setQueryData(
          [`conversation-${conversation.id}` satisfies CacheKey],
          (old: Conversation) => {
            if (!old) return;
            return {
              ...old,
              messages: old.messages.reduce((acc: Message[], curr) => {
                return [
                  ...acc,
                  {
                    ...curr,
                    body:
                      curr.user.id === user.id
                        ? reportedMessageBodyReplacement
                        : curr.body,
                    user: {
                      ...curr.user,
                      bannedAt: user.bannedAt,
                    },
                  },
                ];
              }, []),
            };
          },
        );
      }
      scrollToBottom();
    },
    [queryClient, conversations],
  );

  useEffect(() => {
    const newMessageSubscription = supabaseClientSide
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: unknown & { new: RawMessage }) => {
          onNewMessage({ rawMessage: payload.new });
        },
      )
      .subscribe();

    const reportedMessageSubscription = supabaseClientSide
      .channel("messages")
      .on(
        "broadcast",
        { event: "reported_message" satisfies BroadCastKey },
        ({ payload }: unknown & { payload: Message }) => {
          onReportedMessage({ message: payload });
        },
      )
      .subscribe();

    const bannedUserSubscription = supabaseClientSide
      .channel("users")
      .on(
        "broadcast",
        { event: "banned_user" satisfies BroadCastKey },
        ({ payload }: unknown & { payload: User }) => {
          onBannedUser({
            user: payload,
          });
        },
      )
      .subscribe();

    return () => {
      supabaseClientSide.removeChannel(reportedMessageSubscription);
      supabaseClientSide.removeChannel(bannedUserSubscription);
      supabaseClientSide.removeChannel(newMessageSubscription);
    };
  }, [onNewMessage, onReportedMessage, onBannedUser]);

  return {
    conversation: conversation && {
      ...conversation,
      messages: conversation.messages.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }),
    },
    error,
    isLoading,
    scrollToBottom,
    lastEmptyLiRef,
  };
}
