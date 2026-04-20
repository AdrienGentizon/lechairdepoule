import { useState } from "react";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import useMe from "@/lib/auth/useMe";
import usePostConversation from "@/lib/forum/usePostConversation";

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

const CONVERSATION_TYPE_LABELS = {
  TOPIC: { title: "Nouveau topic", submit: "Créer un topic" },
  EVENT: { title: "Nouvel événement", submit: "Créer un événement" },
  RELEASE: { title: "Nouvelle sortie", submit: "Créer une sortie" },
};

export default function CreateTopicButton() {
  const { me } = useMe();
  const router = useRouter();
  const [step, setStep] = useState<
    "HIDDEN" | "CONVERSATION_TYPE" | "CONVERSATION_INPUTS"
  >("HIDDEN");
  const [selectedConversationType, setSelectedConversationType] = useState<
    "TOPIC" | "EVENT" | "RELEASE" | undefined
  >(undefined);
  const { postConversation, isPending, error } = usePostConversation();

  if (!me?.canCreateConversation()) return null;

  return (
    <Dialog
      open={step !== "HIDDEN"}
      onOpenChange={(open) => {
        if (!open) return setStep("HIDDEN");
        setStep("CONVERSATION_TYPE");
      }}
    >
      <DialogTrigger className="flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-6 font-light uppercase">
        <Plus className="stroke-1" />
        Créer un Topic
      </DialogTrigger>
      <DialogContent className="grid max-h-[calc(100dvh-2rem)] grid-rows-[auto_1fr]">
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
            onSubmit={(values) =>
              postConversation(
                {
                  title: values.title,
                  description: values.description,
                  type: selectedConversationType ?? "TOPIC",
                  cover: values.cover,
                  startsAt: values.startsAt?.toISOString(),
                  endsAt: values.endsAt?.toISOString(),
                },
                {
                  onSuccess: (data) => {
                    setStep("HIDDEN");
                    router.push(`/forum/${data.id}`);
                  },
                }
              )
            }
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
