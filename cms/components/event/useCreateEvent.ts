import { useMutation, useQueryClient } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";

import uploadImage from "@/lib/image/uploadImage";
import { Event } from "@/lib/types";
import { EventInput } from "@/lib/validation";

export default function useCreateEvent(
  organizationId: string,
  options?: {
    onSuccess?: (event: Event) => void;
  },
) {
  const queryClient = useQueryClient();

  const {
    mutate: createEvent,
    error,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async ({
      inputs,
      cover,
    }: {
      inputs: Omit<EventInput, "cover">;
      cover:
        | { action: "KEEP" }
        | { action: "REMOVE" }
        | { action: "REPLACE"; file: File };
    }) => {
      const response = await fetch(
        `/api/organizations/${organizationId}/events`,
        {
          method: "POST",
          body: JSON.stringify({
            ...inputs,
            cover:
              cover.action === "REPLACE"
                ? await uploadImage(organizationId, cover.file)
                : null,
          } satisfies EventInput),
        },
      );

      if (!response.ok) throw await CustomError.fromResponse(response);

      return response.json() as Promise<Event>;
    },
    onSuccess: (event) => {
      queryClient.setQueryData<Event[]>(
        ["organizations", organizationId, "events"],
        (prev) =>
          prev
            ? [event, ...prev].toSorted((a, b) =>
                `${b.startDate}T${b.startTime ?? ""}`.localeCompare(
                  `${a.startDate}T${a.startTime ?? ""}`,
                ),
              )
            : prev,
      );
      queryClient.setQueryData<Event>(
        ["organizations", organizationId, "events", event.id],
        event,
      );
      options?.onSuccess?.(event);
    },
  });

  return {
    createEvent,
    error,
    isPending,
    reset,
  };
}
