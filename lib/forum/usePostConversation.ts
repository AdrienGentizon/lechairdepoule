import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resizeImage } from "../resizeImage";
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
      cover,
    }: {
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

      const response = await fetch(`/api/conversations`, {
        method: "POST",
        body,
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
        }
      );
    },
    onError: console.error,
  });

  return {
    postConversation,
    error,
    isPending,
  };
}
