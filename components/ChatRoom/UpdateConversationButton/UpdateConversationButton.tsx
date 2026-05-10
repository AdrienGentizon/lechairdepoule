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
import useDeleteConversationCover from "@/lib/forum/useDeleteConversationCover";
import useUpdateConversation from "@/lib/forum/useUpdateConversation";
import useUpdateConversationCover from "@/lib/forum/useUpdateConversationCover";
import { Conversation } from "@/lib/types";

export default function UpdateConversationButton({
  me,
  conversation,
}: {
  me: Me;
  conversation: Conversation;
}) {
  const [open, setOpen] = useState(false);
  const [pendingCover, setPendingCover] = useState<File | undefined>(undefined);
  const { deleteConversationCover, isPending: isDeletingCover } =
    useDeleteConversationCover();
  const { updateConversationCover, isPending: isUpdatingCover } =
    useUpdateConversationCover();
  const {
    updateConversation,
    isPending: isUpdatingDetails,
    error,
  } = useUpdateConversation({
    onSuccess: () => setOpen(false),
  });
  const isPending = isDeletingCover || isUpdatingDetails || isUpdatingCover;

  if (!me.canUpdateConversation(conversation)) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:text-purple-300">
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
          conversationType={
            (conversation.type as NonNullable<Conversation["type"]>) ?? "TOPIC"
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
            closedToContributionsAt: conversation.closedToContributionsAt
              ? new Date(conversation.closedToContributionsAt)
              : null,
          }}
          onSubmit={(values) => {
            if (pendingCover) {
              updateConversationCover({
                id: conversation.id,
                cover: pendingCover,
              });
            }
            updateConversation({
              id: conversation.id,
              title: values.title,
              description: values.description,
              startsAt: values.startsAt?.toISOString(),
              endsAt: values.endsAt?.toISOString(),
              closedToContributionsAt:
                values.closedToContributionsAt?.toISOString() ?? null,
            });
          }}
          isPending={isPending}
          error={error as Error | null}
          coverUrl={conversation.coverUrl ?? undefined}
          onDeleteCover={() => deleteConversationCover(conversation.id)}
          onUpdateCover={setPendingCover}
          submitLabel="Sauver"
        />
      </DialogContent>
    </Dialog>
  );
}
