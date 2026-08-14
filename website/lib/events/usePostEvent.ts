import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resizeImage } from "../resizeImage";
import { CacheKey, Conversation } from "../types";

export default function usePostEvent() {
  const queryClient = useQueryClient();
  const {
    mutate: postEvent,
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
      timezone,
      price,
      venue,
      url,
    }: {
      title: string;
      description: string;
      type: string;
      cover?: File;
      startsAt: string;
      endsAt?: string | null;
      timezone: string;
      price?: string | null;
      venue?: string | null;
      url?: string | null;
    }) => {
      const body = new FormData();
      body.set("title", title);
      body.set("description", description);
      body.set("type", type);
      body.set("startsAt", startsAt);
      if (endsAt) body.set("endsAt", endsAt);
      body.set("timezone", timezone);
      if (price) body.set("price", price);
      if (venue) body.set("venue", venue);
      if (url) body.set("url", url);
      if (cover) {
        const resizedImage = await resizeImage(cover);
        if (resizedImage) {
          body.set("coverFile", resizedImage.file);
          body.set("coverWidth", resizedImage.width.toString());
          body.set("coverHeight", resizedImage.height.toString());
        }
      }

      const response = await fetch(`/api/events`, {
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
    onSuccess: (event) => {
      queryClient.setQueryData(
        ["cachedEvents" satisfies CacheKey],
        (olds: Event[] = []) => {
          return [...olds, event];
        }
      );
    },
    onError: console.error,
  });

  return {
    postEvent,
    error,
    isPending,
  };
}
