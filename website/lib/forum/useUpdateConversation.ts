import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Conversation, SimpleConversation } from "../types";

export default function useUpdateConversation(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    mutate: updateConversation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({
      id: conversationId,
      title,
      description,
    }: {
      id: string;
      title: string;
      description: string;
    }) => {
      const body = new FormData();
      body.set("title", title);
      body.set("description", description);

      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        body,
      });

      if (!response.ok) {
        throw new Error(
          (await response.json())?.error ??
            response.statusText ??
            "erreur inconnue"
        );
      }

      return response.json() as Promise<SimpleConversation>;
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
        }
      );
      queryClient.setQueryData(
        [`conversation-${data.id}` satisfies CacheKey],
        (old: Conversation) => {
          return {
            ...old,
            title: data.title,
            description: data.description,
            coverUrl: data.coverUrl,
            coverWidth: data.coverWidth,
            coverHeight: data.coverHeight,
          };
        }
      );

      options?.onSuccess?.();
    },
  });

  return { updateConversation, isPending, error };
}
