import { useMutation, useQueryClient } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";
import { Event } from "@cdp/lib/types";

export default function useDeleteEvent(organizationId: string) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteEvent,
    error,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(
        `/api/organizations/${organizationId}/events/${eventId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw await CustomError.fromResponse(response);

      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.setQueryData<Event[]>(
        ["organizations", organizationId, "events"],
        (prev) => prev?.filter((event) => event.id !== eventId),
      );
      queryClient.removeQueries({
        queryKey: ["organizations", organizationId, "events", eventId],
      });
    },
  });

  return {
    deleteEvent,
    error,
    isPending,
    reset,
  };
}
