import { useState } from "react";

import { Loader, Pencil } from "lucide-react";

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
import useDeleteConversationCover from "@/lib/forum/useDeleteConversationCover";
import useUpdateConversation from "@/lib/forum/useUpdateConversation";
import { Conversation } from "@/lib/types";

export default function UpdateConversationButton({
  me,
  conversation,
}: {
  me: Me;
  conversation: Conversation;
}) {
  const [open, setOpen] = useState(false);
  const { deleteConversationCover, isPending: isDeletePending } =
    useDeleteConversationCover();
  const {
    updateConversation,
    isPending: isUpdatePending,
    error,
  } = useUpdateConversation({
    onSuccess: () => setOpen(false),
  });
  const isPending = isDeletePending || isUpdatePending;

  if (!me.canUpdateConversation(conversation)) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:text-purple-300">
        <Pencil className="size-5" />
        <span className="sr-only">Modifier</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la conversation</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire pour modifier le titre de la conversation
          </DialogDescription>
        </DialogHeader>
        <CreateTopicForm
          conversationType={
            (conversation.type as "TOPIC" | "EVENT" | "RELEASE") ?? "TOPIC"
          }
          initialValues={{
            title: conversation.title,
            description: conversation.description ?? undefined,
            startsAt: conversation.startsAt
              ? new Date(conversation.startsAt)
              : undefined,
            endsAt: conversation.endsAt
              ? new Date(conversation.endsAt)
              : undefined,
          }}
          onSubmit={(values) =>
            updateConversation({
              id: conversation.id,
              title: values.title,
              description: values.description,
              cover: values.cover,
              startsAt: values.startsAt?.toISOString(),
              endsAt: values.endsAt?.toISOString(),
            })
          }
          isPending={isPending}
          error={error as Error | null}
          coverUrl={conversation.coverUrl ?? undefined}
          onDeleteCover={() => deleteConversationCover(conversation.id)}
          submitLabel="Sauver"
        />
        {isPending && (
          <Loader className="absolute inset-0 top-1/2 left-1/2 z-50 -ml-3 animate-spin stroke-2" />
        )}
      </DialogContent>
    </Dialog>
  );
}
