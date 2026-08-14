"use client";

import { SignInButton } from "@clerk/nextjs";

import { useState, useTransition } from "react";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";

import useMe from "@/lib/auth/useMe";
import insertEventAction from "@/lib/events/insertEventAction";
import { resizeImage } from "@/lib/resizeImage";
import { Event, isEventType } from "@/lib/types";

import BannedUserDialogTrigger from "../BannedUserDialogTrigger/BannedUserDialogTrigger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import CreateEventForm from "./CreateEventForm";
import SelectItemToBeCreatedType from "./SelectItemToBeCreatedType";

const EVENT_TYPE_LABELS: Record<
  Event["type"],
  {
    title: string;
    submit: string;
  }
> = {
  EVENT: { title: "Nouvel événement", submit: "Créer un événement" },
  RELEASE: { title: "Nouvelle sortie", submit: "Créer une sortie" },
};

function Content() {
  return (
    <div className="flex w-full items-center justify-center gap-2 font-light uppercase">
      <Plus className="stroke-[1.5px]" aria-hidden="true" />
      <span className="flex flex-col items-start">
        <span className="font-semibold">Créer un événement</span>
        <span className="text-muted-foreground text-xs normal-case">
          Concert · Release Party · Événement
        </span>
      </span>
    </div>
  );
}

function Form({
  selectedEventType,
  onSuccess,
}: {
  selectedEventType: Event["type"];
  onSuccess: (data: { id: string }) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  return (
    <CreateEventForm
      eventType={selectedEventType}
      onSubmit={(values) => {
        setError(null);
        startTransition(async () => {
          const body = new FormData();
          body.set("type", selectedEventType);
          body.set("title", values.title);
          body.set("description", values.description);
          body.set("startsAt", values.startsAt);
          if (values.endsAt) body.set("endsAt", values.endsAt);
          body.set("timezone", values.timezone);
          if (values.price) body.set("price", values.price);
          if (values.venue) body.set("venue", values.venue);
          if (values.url) body.set("url", values.url);
          if (values.cover) {
            const resized = await resizeImage(values.cover);
            if (resized) {
              body.set("coverFile", resized.file);
              body.set("coverWidth", resized.width.toString());
              body.set("coverHeight", resized.height.toString());
            }
          }

          const result = await insertEventAction(body);
          if (!result.success) {
            setError(new Error(result.error));
            return;
          }
          onSuccess({ id: result.data.id });
        });
      }}
      isPending={isPending}
      error={error}
      submitLabel={EVENT_TYPE_LABELS[selectedEventType].submit}
    />
  );
}

function MultiStepCreateEventButton() {
  const router = useRouter();
  const [createParam, setCreateParam] = useQueryState(
    "create",
    parseAsStringEnum(["event", "release"])
  );
  const initialEventType: Event["type"] | undefined =
    createParam === "event"
      ? "EVENT"
      : createParam === "release"
        ? "RELEASE"
        : undefined;

  const [step, setStep] = useState<"HIDDEN" | "EVENT_TYPE" | "EVENT_INPUTS">(
    initialEventType ? "EVENT_INPUTS" : "HIDDEN"
  );
  const [selectedEventType, setSelectedEventType] = useState<
    Event["type"] | undefined
  >(initialEventType);

  return (
    <Dialog
      open={step !== "HIDDEN"}
      onOpenChange={(open) => {
        if (!open) {
          setCreateParam(null);
          return setStep("HIDDEN");
        }
        setStep("EVENT_TYPE");
      }}
    >
      <DialogTrigger className="flex cursor-pointer flex-col gap-2 px-4 py-3">
        <Content />
      </DialogTrigger>
      <DialogContent className="grid grid-cols-1 grid-rows-[auto_1fr] px-2 pb-2 landscape:px-4">
        <DialogHeader>
          <DialogTitle>
            {selectedEventType
              ? EVENT_TYPE_LABELS[selectedEventType].title
              : "Nouveau topic"}
          </DialogTitle>
          <DialogDescription
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {step === "EVENT_TYPE"
              ? "Étape 1 sur 2 : choisir le type de topic"
              : "Étape 2 sur 2 : remplir les informations du topic"}
          </DialogDescription>
        </DialogHeader>
        {step === "EVENT_TYPE" && (
          <SelectItemToBeCreatedType
            types={[
              {
                value: "EVENT",
                label: "Événement",
                description:
                  "Annoncer un concert, une performance et autres événements...",
              },
              {
                value: "RELEASE",
                label: "Sortie",
                description: "Sortie de disque, fanzine, livre, bd...",
              },
            ]}
            onSuccess={(eventType) => {
              setSelectedEventType(
                !eventType
                  ? undefined
                  : isEventType(eventType)
                    ? eventType
                    : "EVENT"
              );
              setStep("EVENT_INPUTS");
            }}
          />
        )}
        {step === "EVENT_INPUTS" && selectedEventType && (
          <Form
            selectedEventType={selectedEventType}
            onSuccess={(data) => {
              setStep("HIDDEN");
              router.push(`/agenda?event=${data.id}`);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function BannedUserCreateTopicButton() {
  return (
    <BannedUserDialogTrigger className="cursor-pointer px-4 py-3">
      <Content />
    </BannedUserDialogTrigger>
  );
}

function UnauthUserCreateTopicButton() {
  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="flex cursor-pointer flex-col gap-2 px-4 py-3"
      >
        <Content />
      </button>
    </SignInButton>
  );
}

export default function CreateEventButton() {
  const { me } = useMe();

  if (me?.bannedAt) return <BannedUserCreateTopicButton />;

  if (!me) return <UnauthUserCreateTopicButton />;

  return <MultiStepCreateEventButton />;
}
