import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BroadCastKey, BroadcastPayload, CacheKey, Message } from "../types";
import { useCallback, useEffect } from "react";
import { supabaseClientSide } from "../supabaseClientSide";

export default function useMainConversation(options?: {
  onLoaded: () => void;
  onNewMessage: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    data: mainConversation = { messages: [] },
    error,
    isLoading,
  } = useQuery({
    queryKey: ["main-conversation" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/messages`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onLoaded();
      return response.json() as Promise<{ messages: Message[] }>;
    },
  });

  const onNewMessage = useCallback(
    ({ payload: message }: BroadcastPayload<"new_message", Message>) => {
      queryClient.setQueryData(
        ["main-conversation" satisfies CacheKey],
        (old: { messages: Message[] } = { messages: [] }) => {
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

  useEffect(() => {
    const subscription = supabaseClientSide
      .channel("messages")
      .on(
        "broadcast",
        { event: "new_message" satisfies BroadCastKey },
        (payload) =>
          onNewMessage(payload as BroadcastPayload<"new_message", Message>),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [onNewMessage]);

  return {
    mainConversation: {
      ...mainConversation,
      messages: mainConversation.messages.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }),
    },
    error,
    isLoading,
  };
}
