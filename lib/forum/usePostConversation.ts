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
      type,
      cover,
      startsAt,
      endsAt,
    }: {
      title: string;
      description: string;
      type: string;
      cover?: File;
      startsAt?: string | null;
      endsAt?: string | null;
    }) => {
      const body = new FormData();
      body.set("title", title);
      body.set("description", description);
      body.set("type", type);
      if (startsAt) body.set("startsAt", startsAt);
      if (endsAt) body.set("endsAt", endsAt);
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
        throw new Error(
          (await response.json())?.error ??
            response.statusText ??
            "erreur inconnue"
        );

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
