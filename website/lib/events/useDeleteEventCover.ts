import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Event } from "../types";

export default function useDeleteEventCover() {
  const queryClient = useQueryClient();
  const { mutate: deleteEventCover, isPending } = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}/cover`, {
        method: "DELETE",
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

  return { deleteEventCover, isPending };
}
