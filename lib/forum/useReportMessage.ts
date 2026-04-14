import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Message } from "../types";

export default function useReportMessage() {
  const queryClient = useQueryClient();

  const {
    mutate: reportMessage,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}/report`, {
        method: "POST",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<Message>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["reported-messages" satisfies CacheKey],
        (olds: Message[] = []) => {
          return [...olds.filter(({ id }) => id !== data.id), data];
        }
      );
    },
  });

  return {
    reportMessage,
    error,
    isPending,
  };
}
