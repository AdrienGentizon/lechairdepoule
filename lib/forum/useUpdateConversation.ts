import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resizeImage } from "../resizeImage";
import { CacheKey, Conversation } from "../types";

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
      cover,
    }: {
      id: string;
      title: string;
      description: string;
      cover?: File;
    }) => {
      const body = new FormData();
      body.set("title", title);
      body.set("description", description);
      if (cover) {
        const resizedImage = await resizeImage(cover);
        if (resizedImage) {
          body.set("coverFile", resizedImage.file);
          body.set("coverWidth", resizedImage.width.toString());
          body.set("coverHeight", resizedImage.height.toString());
        }
      }

      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        body,
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
        }
      );
      queryClient.setQueryData(
        [`conversation-${data.id}` satisfies CacheKey],
        (old: Conversation) => {
          return {
            ...old,
            title: data.title,
            description: data.description,
          };
        }
      );

      options?.onSuccess?.();
    },
  });

  return { updateConversation, isPending, error };
}
