import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BroadCastKey,
  BroadcastPayload,
  CacheKey,
  Conversation,
  Message,
  User,
} from "../types";
import { useCallback, useEffect } from "react";
import { supabaseClientSide } from "../supabaseClientSide";
import { reportedMessageBodyReplacement } from "../wordings";
import { getMessageFromRaw } from "../forum/getMessageFromRaw";

export default function useMainConversation(
  conversationId: string,
  options?: {
    onLoaded: () => void;
    onNewMessage: () => void;
  },
) {
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

      options?.onLoaded();
      return response.json() as Promise<Conversation>;
    },
  });

  const onNewMessage = useCallback(
    ({ payload: message }: BroadcastPayload<"new_message", Message>) => {
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
      options?.onNewMessage();
    },
    [queryClient],
  );

  const onReportedMessage = useCallback(
    ({ payload: message }: BroadcastPayload<"reported_message", Message>) => {
      console.log(message);
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
      options?.onNewMessage();
    },
    [queryClient],
  );

  const onBannedUser = useCallback(
    ({ payload: user }: BroadcastPayload<"banned_user", User>) => {
      queryClient.setQueryData(
        [`conversation-${conversationId}` satisfies CacheKey],
        (old: Conversation) => {
          return {
            ...old,
            messages: old.messages.reduce((acc: Message[], curr) => {
              if (curr.user.id !== user.id) return [...acc, curr];
              return [
                ...acc,
                {
                  ...curr,
                  body: reportedMessageBodyReplacement,
                },
              ];
            }, []),
          };
        },
      );
      options?.onNewMessage();
    },
    [queryClient],
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
        (payload) => {
          onNewMessage({
            payload: getMessageFromRaw(payload.new as any, {
              id: "1",
              pseudo: "nanani",
            }),
          } as BroadcastPayload<"new_message", Message>);
        },
      )
      .subscribe();

    const reportedMessageSubscription = supabaseClientSide
      .channel("messages")
      .on(
        "broadcast",
        { event: "reported_message" satisfies BroadCastKey },
        (payload) =>
          onReportedMessage(
            payload as BroadcastPayload<"reported_message", Message>,
          ),
      )
      .subscribe();

    const bannedUserSubscription = supabaseClientSide
      .channel("messages")
      .on(
        "broadcast",
        { event: "banned_user" satisfies BroadCastKey },
        (payload) =>
          onBannedUser(payload as BroadcastPayload<"banned_user", User>),
      )
      .subscribe();

    return () => {
      supabaseClientSide.removeChannel(reportedMessageSubscription);
      supabaseClientSide.removeChannel(bannedUserSubscription);
      supabaseClientSide.removeChannel(newMessageSubscription);
    };
  }, [onNewMessage]);

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
  };
}
