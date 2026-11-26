import { useMutation, useQueryClient } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";
import { Event } from "@cdp/lib/types";

import { EventStatusInput } from "@/lib/validation";

export default function useUpdateEventStatus(organizationId: string) {
  const queryClient = useQueryClient();

  const {
    mutate: updateEventStatus,
    error,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async ({
      eventId,
      status,
    }: EventStatusInput & { eventId: string }) => {
      const response = await fetch(
        `/api/organizations/${organizationId}/events/${eventId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status } satisfies EventStatusInput),
        },
      );

      if (!response.ok) throw await CustomError.fromResponse(response);

      return response.json() as Promise<Pick<Event, "id" | "deletedAt">>;
    },
    onSuccess: ({ id, deletedAt }) => {
      queryClient.setQueryData<Event[]>(
        ["organizations", organizationId, "events"],
        (prev) =>
          prev?.map((event) =>
            event.id === id ? { ...event, deletedAt } : event,
          ),
      );
      queryClient.setQueryData<Event>(
        ["organizations", organizationId, "events", id],
        (prev) => prev && { ...prev, deletedAt },
      );
    },
  });

  return {
    updateEventStatus,
    error,
    isPending,
    reset,
  };
}
