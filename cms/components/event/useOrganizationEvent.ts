import { useQuery, useQueryClient } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";
import { Event } from "@cdp/lib/types";

export default function useOrganizationEvent(
  organizationId: string,
  eventId: string,
) {
  const queryClient = useQueryClient();

  const {
    data: event,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["organizations", organizationId, "events", eventId],
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations/${organizationId}/events/${eventId}`,
        { method: "GET" },
      );

      if (!response.ok) throw await CustomError.fromResponse(response);

      return response.json() as Promise<Event>;
    },
    initialData: () =>
      queryClient
        .getQueryData<Event[]>(["organizations", organizationId, "events"])
        ?.find(({ id }) => id === eventId),
  });

  return {
    event,
    isFetching,
    error,
  };
}
