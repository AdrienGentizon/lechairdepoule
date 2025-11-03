import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CacheKey, Conversation } from "../types";

export default function useUpdateConversation() {
  const queryClient = useQueryClient();
  const {
    mutate: updateConversation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({
      id: conversationId,
      ...payload
    }: {
      id: string;
      title?: string;
      description?: string;
    }) => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PACTH",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<{
        id: string;
        title: string;
        description: string;
      }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Omit<Conversation, "messages">[] = []) => {
          return olds.reduce((acc: Omit<Conversation, "messages">[], curr) => {
            if (curr.id !== data.id) return [...acc, curr];
            return [
              ...acc,
              {
                ...curr,
                title: data.title,
                description: data.description,
              },
            ];
          }, []);
        },
      );
      queryClient.setQueryData(
        [`conversation-${data.id}` satisfies CacheKey],
        (old: Conversation) => {
          return {
            ...old,
            title: data.title,
            description: data.description,
          };
        },
      );
    },
  });

  return { updateConversation, isPending, error };
}
