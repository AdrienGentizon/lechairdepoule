import { useMutation, useQueryClient } from "@tanstack/react-query";

import uploadImage from "@cdp/lib/image/uploadImage";

import { ConversationInput } from "../schemas";
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
    }: {
      title: string;
      description: string;
      type: string;
      cover?: File;
    }) => {
      const response = await fetch(`/api/conversations`, {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          type,
          cover: cover
            ? await uploadImage({
                file: cover,
                uploadUrlEndpoint: "/api/images/upload-url",
              })
            : null,
        } satisfies ConversationInput & { type: string }),
      });

      if (!response.ok)
        throw new Error(
          (await response.json())?.error ??
            response.statusText ??
            "erreur inconnue",
        );

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
    onError: console.error,
  });

  return {
    postConversation,
    error,
    isPending,
  };
}
