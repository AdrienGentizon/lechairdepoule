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
      cover,
    }: {
      title: string;
      description: string;
      cover?: {
        file: File;
        width: number;
        height: number;
      };
    }) => {
      const body = new FormData();
      body.set("title", title);
      body.set("description", description);
      if (cover) {
        body.set("coverFile", cover.file);
        body.set("coverWidth", cover.width.toString());
        body.set("coverHeight", cover.height.toString());
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
  });

  return {
    postConversation,
    error,
    isPending,
  };
}
