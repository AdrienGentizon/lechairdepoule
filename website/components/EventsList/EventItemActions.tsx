"use client";

import { useState, useTransition } from "react";

import useMe from "@/lib/auth/useMe";
import deleteEventAction from "@/lib/events/deleteEventAction";
import deleteEventCoverAction from "@/lib/events/deleteEventCoverAction";
import updateEventAction from "@/lib/events/updateEventAction";
import updateEventCoverAction from "@/lib/events/updateEventCoverAction";
import { resizeImage } from "@/lib/resizeImage";
import { Event } from "@/lib/types";

import Button from "../Button/Button";
import CreateEventForm from "../CreateEventButton/CreateEventForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function UpdateEventButton({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          isPending={isPending}
          error={error}
          submitLabel="Submit"
          coverUrl={event.coverUrl ?? undefined}
          onUpdateCover={(cover) => {
            startTransition(async () => {
              const resized = await resizeImage(cover);
              if (!resized) {
                setError(new Error("image non valide."));
                return;
              }
              const body = new FormData();
              body.set("coverFile", resized.file);
              body.set("coverWidth", resized.width.toString());
              body.set("coverHeight", resized.height.toString());

              const result = await updateEventCoverAction(event.id, body);
              if (!result.success) setError(new Error(result.error));
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
                startsAt: values.startsAt,
                endsAt: values.endsAt ?? null,
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
      </DialogContent>
    </Dialog>
  );
}

function DeleteEventButton({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer text-xs text-neutral-200 hover:text-purple-300 hover:underline">
          supprimer
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogDescription className="sr-only">
          Confirmation avant la suppression définitive de l&apos;événement
        </DialogDescription>
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
      </DialogContent>
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
