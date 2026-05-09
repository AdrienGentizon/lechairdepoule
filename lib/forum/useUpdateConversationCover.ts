import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resizeImage } from "../resizeImage";
import { CacheKey, Conversation, SimpleConversation } from "../types";

export default function useUpdateConversationCover() {
  const queryClient = useQueryClient();
  const { mutate: updateConversationCover, isPending } = useMutation({
    mutationFn: async ({
      id: conversationId,
      cover,
    }: {
      id: string;
      cover: File;
    }) => {
      const body = new FormData();
      const resizedImage = await resizeImage(cover);

      if (resizedImage) {
        body.set("coverFile", resizedImage.file);
        body.set("coverWidth", resizedImage.width.toString());
        body.set("coverHeight", resizedImage.height.toString());
      }

      const response = await fetch(
        `/api/conversations/${conversationId}/cover`,
        { method: "POST", body }
      );

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<SimpleConversation>;
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

  return { updateConversationCover, isPending };
}
