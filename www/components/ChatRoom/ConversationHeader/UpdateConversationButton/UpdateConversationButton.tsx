import { PencilSimpleIcon } from "@phosphor-icons/react";

import { useState } from "react";

import Dialog from "@cdp/ui/Dialog";

import CreateTopicForm from "@/components/CreateTopicButton/CreateTopicForm";
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
      <Dialog.Trigger className="inline-flex cursor-pointer items-center gap-2 rounded-sm hover:text-purple-300">
        <PencilSimpleIcon className="size-5" />
        <span className="sr-only">Modifier</span>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Modifier la conversation</Dialog.Title>
        <Dialog.Description className="sr-only">
          Formulaire pour modifier le titre de la conversation
        </Dialog.Description>
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
      </Dialog.Content>
    </Dialog>
  );
}
