"use client";

import useMe from "@/lib/auth/useMe";
import useDeleteEvent from "@/lib/events/useDeleteEvent";
import useDeleteEventCover from "@/lib/events/useDeleteEventCover";
import useUpdateEvent from "@/lib/events/useUpdateEvent";
import useUpdateEventCover from "@/lib/events/useUpdateEventCover";
import { Event } from "@/lib/types";

import CreateEventForm from "../CreateEventButton/CreateEventForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function UpdateEventButton({ event }: { event: Event }) {
  const { updateEvent, isPending: isUpdating } = useUpdateEvent();
  const { updateEventCover } = useUpdateEventCover();
  const { deleteEventCover } = useDeleteEventCover();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="cursor-pointer text-xs text-neutral-200 hover:text-purple-300 hover:underline">
          modifier
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Modification de l'événement`}</DialogTitle>
        </DialogHeader>
        <CreateEventForm
          initialValues={{
            ...event,
            startsAt: new Date(event.startsAt),
            endsAt: event.endsAt ? new Date(event.endsAt) : undefined,
          }}
          eventType={event.type}
          isPending={isUpdating}
          submitLabel="Submit"
          coverUrl={event.coverUrl ?? undefined}
          onUpdateCover={(cover) => updateEventCover({ id: event.id, cover })}
          onDeleteCover={() => deleteEventCover(event.id)}
          onSubmit={(values) => {
            updateEvent({
              id: event.id,
              type: event.type,
              ...values,
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function EventItemActions({ event }: { event: Event }) {
  const { me } = useMe();
  const { deleteEvent, isPending: isDeleting } = useDeleteEvent();

  if (event.createdBy.id !== me?.id) return null;
  return (
    <div className="absolute bottom-0 flex w-full items-center justify-end gap-1 px-2">
      <UpdateEventButton event={event} />
      <span aria-hidden>·</span>
      <button
        className="cursor-pointer text-xs text-neutral-200 hover:text-purple-300 hover:underline"
        onClick={() => {
          deleteEvent(event.id);
        }}
        disabled={isDeleting}
      >
        supprimer
      </button>
    </div>
  );
}
