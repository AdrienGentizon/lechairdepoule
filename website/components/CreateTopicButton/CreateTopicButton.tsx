import { SignInButton } from "@clerk/nextjs";

import { useEffect, useState } from "react";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import useMe from "@/lib/auth/useMe";
import usePostConversation from "@/lib/forum/usePostConversation";

import BannedUserDialogTrigger from "../BannedUserDialogTrigger/BannedUserDialogTrigger";
import { buttonClassName } from "../Button/Button";
import SelectItemToBeCreatedType from "../CreateEventButton/SelectItemToBeCreatedType";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import CreateTopicForm from "./CreateTopicForm";

const CONVERSATION_TYPE_LABELS: Record<
  "TOPIC" | "EVENT" | "RELEASE",
  {
    title: string;
    submit: string;
  }
> = {
  TOPIC: { title: "Nouveau topic", submit: "Créer un topic" },
  EVENT: { title: "Nouvel événement", submit: "Créer un événement" },
  RELEASE: { title: "Nouvelle sortie", submit: "Créer une sortie" },
};

function Redirection({
  selectedConversationType,
}: {
  selectedConversationType: "TOPIC" | "EVENT" | "RELEASE";
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5000);
  const url = `/agenda?create=${selectedConversationType.toLowerCase()}`;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) return;
    router.push(url);
  }, [countdown, router, url]);

  return (
    <div className="flex flex-col items-center gap-2 p-4 leading-none">
      <p>
        {`La création d'événement a été déplacée sur la page `}
        <Link href={url} className="text-purple-300 underline">
          /agenda
        </Link>
        .
      </p>
      <p className="text-sm font-light text-neutral-200">
        vous allez être redirigé automatiquement dans {countdown / 1000}s.
      </p>
      <Link href={url} className={buttonClassName("w-full")}>
        Y aller maintenant
      </Link>
    </div>
  );
}

function Form({
  selectedConversationType,
  onSuccess,
}: {
  selectedConversationType: "TOPIC" | "EVENT" | "RELEASE";
  onSuccess: (data: { id: string }) => void;
}) {
  const { postConversation, isPending, error } = usePostConversation();

  if (
    selectedConversationType === "EVENT" ||
    selectedConversationType === "RELEASE"
  )
    return <Redirection selectedConversationType={selectedConversationType} />;

  return (
    <CreateTopicForm
      conversationType={selectedConversationType ?? "TOPIC"}
      onSubmit={(values) => {
        postConversation(
          {
            title: values.title,
            description: values.description,
            type: selectedConversationType ?? "TOPIC",
          },
          {
            onSuccess,
          }
        );
      }}
      isPending={isPending}
      error={error as Error | null}
      submitLabel={
        CONVERSATION_TYPE_LABELS[selectedConversationType ?? "TOPIC"].submit
      }
    />
  );
}

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
    "TOPIC" | "EVENT" | "RELEASE" | undefined
  >(undefined);

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
          <SelectItemToBeCreatedType
            types={[
              {
                value: "TOPIC",
                label: "Discussion",
                description: "Sujets divers et variés...",
              },
              {
                value: "EVENT",
                label: "Evénement",
                description:
                  "Annoncer un concert, une performance et autres événements...",
              },
              {
                value: "RELEASE",
                label: "Sortie",
                description: "Sortie de disque, fanzine, livre, bd...",
              },
            ]}
            onSuccess={(conversationType) => {
              setSelectedConversationType(conversationType);
              setStep("CONVERSATION_INPUTS");
            }}
          />
        )}
        {step === "CONVERSATION_INPUTS" && (
          <Form
            selectedConversationType={selectedConversationType ?? "TOPIC"}
            onSuccess={(data) => {
              setStep("HIDDEN");
              router.push(`/forum/${data.id}`);
            }}
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
