import { useMutation, useQueryClient } from "@tanstack/react-query";

import { resizeImage } from "../resizeImage";
import { CacheKey, Event } from "../types";

export default function useUpdateEventCover() {
  const queryClient = useQueryClient();
  const { mutate: updateEventCover, isPending } = useMutation({
    mutationFn: async ({ id: eventId, cover }: { id: string; cover: File }) => {
      const body = new FormData();
      const resizedImage = await resizeImage(cover);

      if (resizedImage) {
        body.set("coverFile", resizedImage.file);
        body.set("coverWidth", resizedImage.width.toString());
        body.set("coverHeight", resizedImage.height.toString());
      }

      const response = await fetch(`/api/events/${eventId}/cover`, {
        method: "POST",
        body,
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<
        Pick<Event, "id" | "coverUrl" | "coverWidth" | "coverHeight">
      >;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["cachedEvents" satisfies CacheKey],
        (olds: Event[] = []) =>
          olds.map((event) =>
            event.id !== data.id ? event : { ...event, ...data }
          )
      );
    },
  });

  return { updateEventCover, isPending };
}
