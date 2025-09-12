import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CacheKey, Message } from "../types";

export default function usePostMainConversationMessage() {
  const queryClient = useQueryClient();

  const {
    mutate: postMainConversationMessage,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["main-conversation" satisfies CacheKey],
    mutationFn: async (
      body: string,
      options?: {
        onSuccess: () => void;
      },
    ) => {
      const response = await fetch(`/api/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
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
    postMainConversationMessage,
    error,
    isPending,
  };
}
