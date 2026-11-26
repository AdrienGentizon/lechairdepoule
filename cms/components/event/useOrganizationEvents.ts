import { useQuery } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";
import { Event } from "@cdp/lib/types";

export default function useOrganizationEvents(organizationId: string) {
  const {
    data: events = [],
    isFetching,
    error,
  } = useQuery({
    queryKey: ["organizations", organizationId, "events"],
    queryFn: async () => {
      const response = await fetch(
        `/api/organizations/${organizationId}/events`,
        { method: "GET" },
      );

      if (!response.ok) throw await CustomError.fromResponse(response);

      return response.json() as Promise<Event[]>;
    },
  });

  return {
    events,
    isFetching,
    error,
  };
}
