import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useCallback, useEffect } from "react";

import { usePusher } from "@/contexts/PusherProvider";

import useMe from "../auth/useMe";
import { CacheKey, Conversation } from "../types";

export default function useConversations(options?: { onLoaded?: () => void }) {
  const pusher = usePusher()?.pusher;
  const { me } = useMe();
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["conversations" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/conversations`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onLoaded?.();
      return response.json() as Promise<Omit<Conversation, "messages">[]>;
    },
  });

  const onReportedConversation = useCallback(
    (conversation: Omit<Conversation, "messages">) => {
      if (me?.role === "admin") return;
      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Omit<Conversation, "messages">[] = []) =>
          olds.filter(({ id }) => id !== conversation.id)
      );
      queryClient.removeQueries({
        queryKey: [`conversation-${conversation.id}` satisfies CacheKey],
      });
    },
    [me, queryClient]
  );

  useEffect(() => {
    if (!pusher) return;
    const conversationsChannel = pusher.subscribe(`conversations`);
    conversationsChannel.bind("conversation:report", onReportedConversation);
    return () => {
      pusher.unsubscribe(`conversations`);
    };
  }, [pusher, onReportedConversation]);

  return {
    conversations,
    error,
    isLoading,
  };
}
