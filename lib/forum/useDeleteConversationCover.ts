import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Conversation } from "../types";

export default function useDeleteConversationCover() {
  const queryClient = useQueryClient();
  const { mutate: deleteConversationCover, isPending } = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(
        `/api/conversations/${conversationId}/cover`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<
        Omit<Conversation, "messages" | "createdAt" | "createdBy">
      >;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Omit<Conversation, "messages">[] = []) =>
          olds.reduce((acc: Omit<Conversation, "messages">[], curr) => {
            if (curr.id !== data.id) return [...acc, curr];
            return [
              ...acc,
              {
                ...curr,
                coverUrl: data.coverUrl,
                coverWidth: data.coverWidth,
                coverHeight: data.coverHeight,
              },
            ];
          }, [])
      );
      queryClient.setQueryData(
        [`conversation-${data.id}` satisfies CacheKey],
        (old: Conversation) => ({
          ...old,
          coverUrl: data.coverUrl,
          coverWidth: data.coverWidth,
          coverHeight: data.coverHeight,
        })
      );
    },
  });

  return { deleteConversationCover, isPending };
}
