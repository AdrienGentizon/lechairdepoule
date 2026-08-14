import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Event } from "../types";

export default function useUpdateEvent(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const {
    mutate: updateEvent,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({
      id: eventId,
      type,
      title,
      description,
      startsAt,
      endsAt,
      timezone,
      price,
      venue,
      url,
    }: {
      id: string;
      type: string;
      title: string;
      description: string;
      startsAt: string;
      endsAt?: string | null;
      timezone: string;
      price?: string | null;
      venue?: string | null;
      url?: string | null;
    }) => {
      const body = new FormData();
      body.set("type", type);
      body.set("title", title);
      body.set("description", description);
      body.set("startsAt", startsAt);
      if (endsAt) body.set("endsAt", endsAt);
      body.set("timezone", timezone);
      if (price) body.set("price", price);
      if (venue) body.set("venue", venue);
      if (url) body.set("url", url);

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        body,
      });

      if (!response.ok) {
        throw new Error(
          (await response.json())?.error ??
            response.statusText ??
            "erreur inconnue"
        );
      }

      return response.json() as Promise<Omit<Event, "createdBy">>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["cachedEvents" satisfies CacheKey],
        (olds: Event[] = []) => {
          return olds.map((event) =>
            event.id !== data.id ? event : { ...event, ...data }
          );
        }
      );
      options?.onSuccess?.();
    },
  });

  return { updateEvent, isPending, error };
}
