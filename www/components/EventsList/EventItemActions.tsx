"use client";

import { useState, useTransition } from "react";

import uploadImage from "@cdp/lib/image/uploadImage";
import Dialog from "@cdp/ui/Dialog";

import useMe from "@/lib/auth/useMe";
import deleteEventAction from "@/lib/events/deleteEventAction";
import deleteEventCoverAction from "@/lib/events/deleteEventCoverAction";
import updateEventAction from "@/lib/events/updateEventAction";
import updateEventCoverAction from "@/lib/events/updateEventCoverAction";
import { Event } from "@/lib/types";

import Button from "../Button/Button";
import CreateEventForm from "../CreateEventButton/CreateEventForm";

function UpdateEventButton({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="cursor-pointer text-xs text-neutral-200 hover:text-purple-300 hover:underline">
        modifier
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>{`Modification de l'événement`}</Dialog.Title>
        <CreateEventForm
          initialValues={event}
          eventType={event.type}
          isPending={isPending}
          error={error}
          submitLabel="Submit"
          coverUrl={event.coverUrl ?? undefined}
          onUpdateCover={(cover) => {
            startTransition(async () => {
              try {
                const uploadedCover = await uploadImage({
                  file: cover,
                  uploadUrlEndpoint: "/api/images/upload-url",
                });
                const result = await updateEventCoverAction(
                  event.id,
                  uploadedCover,
                );
                if (!result.success) setError(new Error(result.error));
              } catch (error) {
                setError(error as Error);
              }
            });
          }}
          onDeleteCover={() => {
            startTransition(async () => {
              const result = await deleteEventCoverAction(event.id);
              if (!result.success) setError(new Error(result.error));
            });
          }}
          onSubmit={(values) => {
            setError(null);
            startTransition(async () => {
              const result = await updateEventAction(event.id, {
                type: event.type,
                title: values.title,
                description: values.description,
                startDate: values.startDate,
                startTime: values.startTime,
                endDate: values.endDate,
                endTime: values.endTime,
                timezone: values.timezone,
                price: values.price ?? null,
                venue: values.venue,
                url: values.url,
              });
              if (!result.success) {
                setError(new Error(result.error));
                return;
              }
              setOpen(false);
            });
          }}
        />
      </Dialog.Content>
    </Dialog>
  );
}

function DeleteEventButton({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="cursor-pointer text-xs text-neutral-200 hover:text-purple-300 hover:underline">
        supprimer
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Confirmer la suppression</Dialog.Title>
        <Dialog.Description className="sr-only">
          Confirmation avant la suppression définitive de l&apos;événement
        </Dialog.Description>
        <div className="flex flex-col gap-2 leading-5">
          <p>
            Vous êtes sur le point de supprimer l&apos;événement{" "}
            <strong className="uppercase">{event.title}</strong>.
          </p>
          <p>Voulez-vous poursuivre ?</p>
        </div>
        <footer className="flex justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            disabled={isPending}
            className="border-red-500 bg-red-900 bg-opacity-50 text-red-500 hover:border-red-500 hover:bg-red-900 hover:bg-opacity-30 hover:text-red-600"
            onClick={() => {
              startTransition(async () => {
                await deleteEventAction(event.id);
                setOpen(false);
              });
            }}
          >
            Supprimer
          </Button>
        </footer>
      </Dialog.Content>
    </Dialog>
  );
}

export default function EventItemActions({ event }: { event: Event }) {
  const { me } = useMe();

  if (event.createdBy.id !== me?.id) return null;
  return (
    <div className="absolute bottom-0 flex w-full items-center justify-end gap-1 px-2">
      <UpdateEventButton event={event} />
      <span aria-hidden>·</span>
      <DeleteEventButton event={event} />
    </div>
  );
}
