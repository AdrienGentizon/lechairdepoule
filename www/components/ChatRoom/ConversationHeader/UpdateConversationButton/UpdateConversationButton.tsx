import { useState } from "react";

import { Pencil } from "lucide-react";

import CreateTopicForm from "@/components/CreateTopicButton/CreateTopicForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Me } from "@/lib/auth/useMe";
import useUpdateConversation from "@/lib/forum/useUpdateConversation";
import { Conversation } from "@/lib/types";

export default function UpdateConversationButton({
  me,
  conversation,
}: {
  me?: Me;
  conversation: Conversation;
}) {
  const [open, setOpen] = useState(false);

  const { updateConversation, isPending, error } = useUpdateConversation({
    onSuccess: () => setOpen(false),
  });

  if (!me?.canUpdateConversation(conversation)) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex cursor-pointer items-center gap-2 rounded-sm hover:text-purple-300">
        <Pencil className="size-5" />
        <span className="sr-only">Modifier</span>
      </DialogTrigger>
      <DialogContent className="grid grid-cols-1 grid-rows-[auto_1fr] px-2 pb-2 landscape:px-4">
        <DialogHeader>
          <DialogTitle>Modifier la conversation</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire pour modifier le titre de la conversation
          </DialogDescription>
        </DialogHeader>
        <CreateTopicForm
          conversationType={conversation.type}
          initialValues={{
            title: conversation.title,
            description: conversation.description ?? undefined,
          }}
          onSubmit={(values) => {
            updateConversation({
              id: conversation.id,
              title: values.title,
              description: values.description,
            });
          }}
          isPending={isPending}
          error={error as Error | null}
          submitLabel="Sauver"
        />
      </DialogContent>
    </Dialog>
  );
}
