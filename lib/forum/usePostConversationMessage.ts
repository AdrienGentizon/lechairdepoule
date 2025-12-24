import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Conversation, Message } from "../types";

export default function usePostConversationMessage(conversationId: string) {
  const queryClient = useQueryClient();

  const {
    mutate: postConversationMessage,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (
      {
        body,
        parentMessageId,
      }: { body: string; parentMessageId: string | null },
      options?: {
        onSuccess: () => void;
      }
    ) => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "POST",
        body: JSON.stringify({ body, parentMessageId }),
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onSuccess();
      return response.json() as Promise<Message>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [`conversation-${conversationId}` satisfies CacheKey],
        (old: Conversation) => {
          return {
            ...old,
            messages: [
              ...old.messages.filter(({ id }) => id !== data.id),
              data,
            ],
          };
        }
      );
    },
  });

  return {
    postConversationMessage,
    error,
    isPending,
  };
}
