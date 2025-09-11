import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CacheKey, Message } from "../types";

export default function useReportMessage() {
  const queryClient = useQueryClient();

  const {
    mutate: reportMessage,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (
      messageId: string,
      options?: {
        onSuccess: () => void;
      },
    ) => {
      const response = await fetch(`/api/messages/${messageId}/report`, {
        method: "POST",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onSuccess();
      return response.json() as Promise<Message>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["main-conversation" satisfies CacheKey],
        (existings: { messages: Message[] } = { messages: [] }) => {
          return {
            ...existings,
            messages: [
              ...existings.messages.filter(({ id }) => id !== data.id),
              data,
            ],
          };
        },
      );
    },
  });

  return {
    reportMessage,
    error,
    isPending,
  };
}
