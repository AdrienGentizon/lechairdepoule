import { useState } from "react";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function CreateTopicButton() {
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
      <DialogTrigger className="flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-6 font-light uppercase">
        <Plus className="stroke-1" />
        Créer un Topic
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Topic</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire pour créer un nouveau topic dans le forum
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
            onSuccess={(conversationId: string) => {
              setStep("HIDDEN");
              router.push(`/forum/${conversationId}`);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
