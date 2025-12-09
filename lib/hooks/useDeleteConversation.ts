import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Conversation } from "../types";

export default function useDeleteConversation(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    mutate: deleteConversation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<{ conversationId: string }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Omit<Conversation, "messages">[] = []) => {
          return olds.filter(({ id }) => id !== data.conversationId);
        }
      );
      options?.onSuccess?.();
    },
  });

  return { deleteConversation, isPending, error };
}
