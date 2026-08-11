import { SignInButton } from "@clerk/nextjs";

import { useState } from "react";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import useMe from "@/lib/auth/useMe";
import usePostConversation from "@/lib/forum/usePostConversation";
import { Conversation } from "@/lib/types";

import BannedUserDialogTrigger from "../BannedUserDialogTrigger/BannedUserDialogTrigger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import CreateTopicForm from "./CreateTopicForm";
import SelectTopicType from "./SelectTopicType";

const CONVERSATION_TYPE_LABELS: Record<
  NonNullable<Conversation["type"]>,
  {
    title: string;
    submit: string;
  }
> = {
  TOPIC: { title: "Nouveau topic", submit: "Créer un topic" },
  EVENT: { title: "Nouvel événement", submit: "Créer un événement" },
  RELEASE: { title: "Nouvelle sortie", submit: "Créer une sortie" },
};

function Content() {
  return (
    <div className="flex w-full items-center justify-center gap-2 font-light uppercase">
      <Plus className="stroke-[1.5px]" aria-hidden="true" />
      <span className="flex flex-col items-start">
        <span className="font-semibold">Créer une discussion</span>
        <span className="text-muted-foreground text-xs normal-case">
          Topic · Événement · Sortie
        </span>
      </span>
    </div>
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

function MultiStepCreateTopicButton() {
  const router = useRouter();
  const [step, setStep] = useState<
    "HIDDEN" | "CONVERSATION_TYPE" | "CONVERSATION_INPUTS"
  >("HIDDEN");
  const [selectedConversationType, setSelectedConversationType] = useState<
    NonNullable<Conversation["type"]> | undefined
  >(undefined);
  const { postConversation, isPending, error } = usePostConversation();

  return (
    <Dialog
      open={step !== "HIDDEN"}
      onOpenChange={(open) => {
        if (!open) return setStep("HIDDEN");
        setStep("CONVERSATION_TYPE");
      }}
    >
      <DialogTrigger className="flex cursor-pointer flex-col gap-2 px-4 py-3">
        <Content />
      </DialogTrigger>
      <DialogContent className="grid grid-cols-1 grid-rows-[auto_1fr] px-2 pb-2 landscape:px-4">
        <DialogHeader>
          <DialogTitle>
            {selectedConversationType
              ? CONVERSATION_TYPE_LABELS[selectedConversationType].title
              : "Nouveau topic"}
          </DialogTitle>
          <DialogDescription
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {step === "CONVERSATION_TYPE"
              ? "Étape 1 sur 2 : choisir le type de topic"
              : "Étape 2 sur 2 : remplir les informations du topic"}
          </DialogDescription>
        </DialogHeader>
        {step === "CONVERSATION_TYPE" && (
          <SelectTopicType
            onSuccess={(conversationType) => {
              setSelectedConversationType(conversationType);
              setStep("CONVERSATION_INPUTS");
            }}
          />
        )}
        {step === "CONVERSATION_INPUTS" && (
          <CreateTopicForm
            conversationType={selectedConversationType ?? "TOPIC"}
            onSubmit={(values) => {
              postConversation(
                {
                  title: values.title,
                  description: values.description,
                  type: selectedConversationType ?? "TOPIC",
                  cover: values.cover,
                  startsAt: values.startsAt,
                  endsAt: values.endsAt,
                  price: values.price,
                  venue: values.venue,
                  url: values.url,
                  closedToContributionsAt: values.closedToContributionsAt,
                },
                {
                  onSuccess: (data) => {
                    setStep("HIDDEN");
                    router.push(`/forum/${data.id}`);
                  },
                }
              );
            }}
            isPending={isPending}
            error={error as Error | null}
            submitLabel={
              CONVERSATION_TYPE_LABELS[selectedConversationType ?? "TOPIC"]
                .submit
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CreateTopicButton() {
  const { me } = useMe();

  if (me?.bannedAt) return <BannedUserCreateTopicButton />;

  if (!me) return <UnauthUserCreateTopicButton />;

  return <MultiStepCreateTopicButton />;
}
