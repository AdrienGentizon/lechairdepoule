import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Event } from "../types";

export default function useDeleteEvent(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const {
    mutate: deleteEvent,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<{ eventId: string }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["cachedEvents" satisfies CacheKey],
        (olds: Event[] = []) => {
          return olds.filter(({ id }) => id !== data.eventId);
        }
      );
      options?.onSuccess?.();
    },
  });

  return { deleteEvent, isPending, error };
}
