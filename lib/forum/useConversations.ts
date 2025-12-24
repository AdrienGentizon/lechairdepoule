import { useQuery } from "@tanstack/react-query";

import { CacheKey, Conversation } from "../types";

export default function useConversations(options?: { onLoaded?: () => void }) {
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

  return {
    conversations,
    error,
    isLoading,
  };
}
