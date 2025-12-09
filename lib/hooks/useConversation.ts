import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ComponentRef, useCallback, useEffect, useRef } from "react";

import { usePusher } from "@/components/providers/PusherProvider";

import { CacheKey, Conversation, Message, User } from "../types";
import { reportedMessageBodyReplacement } from "../wordings";
import useConversations from "./useConversations";

export default function useConversation(conversationId: string) {
  const { pusher } = usePusher();
  const { conversations } = useConversations();
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
        }
      );
      scrollToBottom();
    },
    [queryClient]
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
        }
      );
      scrollToBottom;
    },
    [queryClient]
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
          }
        );
      }
      scrollToBottom();
    },
    [queryClient, conversations]
  );

  useEffect(() => {
    const conversationChannel = pusher.subscribe(
      `conversations-${conversationId}`
    );
    conversationChannel.bind(
      "conversation:message:new",
      function (message: Message) {
        onNewMessage({ message });
      }
    );

    conversationChannel.bind(
      "conversation:message:report",
      function (message: Message) {
        onReportedMessage({ message });
      }
    );

    const usersChannel = pusher.subscribe(`users`);

    usersChannel.bind("user:ban", function (user: User) {
      onBannedUser({ user });
    });

    return () => {
      pusher.unsubscribe(`conversations-${conversationId}`);
      pusher.unsubscribe(`users`);
    };
  }, []);

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
