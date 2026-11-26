import { useMutation, useQueryClient } from "@tanstack/react-query";

import CustomError from "@cdp/lib/CustomError";
import uploadImage from "@cdp/lib/image/uploadImage";

import { Event } from "@/lib/types";
import { EventInput, EventUpdateInput } from "@/lib/validation";

export default function useUpdateEvent(
  organizationId: string,
  eventId: string,
  options?: {
    onSuccess?: (event: Event) => void;
  },
) {
  const queryClient = useQueryClient();

  const {
    mutate: updateEvent,
    error,
    isPending,
    reset,
  } = useMutation({
    mutationFn: async ({
      inputs,
      cover,
    }: {
      inputs: Omit<EventInput, "type" | "cover">;
      cover:
        | { action: "KEEP" }
        | { action: "REMOVE" }
        | { action: "REPLACE"; file: File };
    }) => {
      const response = await fetch(
        `/api/organizations/${organizationId}/events/${eventId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...inputs,
            cover:
              cover.action === "REPLACE"
                ? {
                    action: "REPLACE",
                    ...(await uploadImage({
                      file: cover.file,
                      uploadUrlEndpoint: `/api/organizations/${organizationId}/images/upload-url`,
                    })),
                  }
                : cover,
          } satisfies EventUpdateInput),
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
            ?.map((prevEvent) =>
              prevEvent.id === event.id ? event : prevEvent,
            )
            .toSorted((a, b) =>
              `${b.startDate}T${b.startTime ?? ""}`.localeCompare(
                `${a.startDate}T${a.startTime ?? ""}`,
              ),
            ),
      );
      queryClient.setQueryData<Event>(
        ["organizations", organizationId, "events", event.id],
        event,
      );
      options?.onSuccess?.(event);
    },
  });

  return {
    updateEvent,
    error,
    isPending,
    reset,
  };
}
