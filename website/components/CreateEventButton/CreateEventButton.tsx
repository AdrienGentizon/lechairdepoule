"use client";

import { SignInButton } from "@clerk/nextjs";

import { useState } from "react";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import useMe from "@/lib/auth/useMe";
import usePostEvent from "@/lib/events/usePostEvent";
import { Event } from "@/lib/types";

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
  const { postEvent, isPending, error } = usePostEvent();

  return (
    <CreateEventForm
      eventType={selectedEventType}
      onSubmit={(values) => {
        postEvent(
          {
            title: values.title,
            description: values.description,
            type: selectedEventType,
            cover: values.cover,
            startsAt: values.startsAt,
            endsAt: values.endsAt,
            timezone: values.timezone,
            price: values.price,
            venue: values.venue,
            url: values.url,
          },
          {
            onSuccess,
          }
        );
      }}
      isPending={isPending}
      error={error as Error | null}
      submitLabel={EVENT_TYPE_LABELS[selectedEventType].submit}
    />
  );
}

function MultiStepCreateEventButton() {
  const router = useRouter();
  const [step, setStep] = useState<"HIDDEN" | "EVENT_TYPE" | "EVENT_INPUTS">(
    "HIDDEN"
  );
  const [selectedEventType, setSelectedEventType] = useState<
    Event["type"] | undefined
  >(undefined);

  return (
    <Dialog
      open={step !== "HIDDEN"}
      onOpenChange={(open) => {
        if (!open) return setStep("HIDDEN");
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
              setSelectedEventType(eventType);
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
