import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CacheKey, Conversation } from "../types";

export default function usePostConversation() {
  const queryClient = useQueryClient();
  const {
    mutate: postConversation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => {
      const response = await fetch(`/api/conversations`, {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<Conversation>;
    },
    onSuccess: ({ messages: _messages, ...conversation }) => {
      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Omit<Conversation, "messages">[] = []) => {
          return [...olds, conversation];
        },
      );
    },
  });

  return {
    postConversation,
    error,
    isPending,
  };
}
