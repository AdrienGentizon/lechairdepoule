import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Conversation } from "../types";

export default function useReportConversation(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const {
    mutate: reportConversation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(
        `/api/conversations/${conversationId}/report`,
        { method: "POST" }
      );

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<Omit<Conversation, "messages">>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Omit<Conversation, "messages">[] = []) =>
          olds.filter(({ id }) => id !== data.id)
      );
      options?.onSuccess?.();
    },
  });

  return { reportConversation, isPending, error };
}
