import { useState } from "react";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useDeleteConversation from "@/lib/forum/useDeleteConversation";
import { Conversation } from "@/lib/types";

export default function DeleteConversationButton({
  conversation,
}: {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-sm p-2 hover:bg-neutral-800 hover:text-neutral-100">
          <Trash2 className="size-5" />
          <span className="sr-only">Supprimer</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <div className="flex flex-col gap-2 leading-5">
          <p>
            Vous êtes sur le point de supprimer la conversation{" "}
            <strong className="uppercase">{conversation.title}</strong> ainsi
            que tous les messages qu'elle contient.
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
      </DialogContent>
    </Dialog>
  );
}
