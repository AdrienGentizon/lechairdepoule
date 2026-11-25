import { TrashIcon } from "@phosphor-icons/react";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Dialog from "@cdp/ui/Dialog";

import Button from "@/components/Button/Button";
import { Me } from "@/lib/auth/useMe";
import useDeleteConversation from "@/lib/forum/useDeleteConversation";
import { Conversation } from "@/lib/types";

export default function DeleteConversationButton({
  me,
  conversation,
}: {
  me?: Me;
  conversation: Conversation;
}) {
  const router = useRouter();
  const { deleteConversation, isPending } = useDeleteConversation({
    onSuccess: () => {
      setOpen(false);
      router.push("/forum");
    },
  });

  const [open, setOpen] = useState(false);

  if (!me?.canDeleteConversation(conversation)) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex cursor-pointer items-center gap-2 rounded-sm hover:text-purple-300">
        <TrashIcon className="size-5" />
        <span className="sr-only">Supprimer</span>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Confirmer la suppression</Dialog.Title>
        <Dialog.Description className="sr-only">
          Confirmation avant la suppression définitive de la conversation et de
          tous ses messages
        </Dialog.Description>
        <div className="flex flex-col gap-2 leading-5">
          <p>
            Vous êtes sur le point de supprimer la conversation{" "}
            <strong className="uppercase">{conversation.title}</strong> ainsi
            que tous les messages qu&apos;elle contient.
          </p>
          <p>Voulez-vous poursuivre ?</p>
        </div>
        <footer className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            Annuler
          </Button>
          <Button
            disabled={isPending}
            className="border-red-500 bg-red-900 bg-opacity-50 text-red-500 hover:border-red-500 hover:bg-red-900 hover:bg-opacity-30 hover:text-red-600"
            onClick={() => {
              deleteConversation(conversation.id);
            }}
          >
            Supprimer
          </Button>
        </footer>
      </Dialog.Content>
    </Dialog>
  );
}
