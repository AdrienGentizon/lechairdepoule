import { useState } from "react";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";

import Button from "@/components/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Me } from "@/lib/auth/useMe";
import useReportConversation from "@/lib/forum/useReportConversation";
import { Conversation } from "@/lib/types";

export default function ReportConversationButton({
  me,
  conversation,
}: {
  me: Me;
  conversation: Conversation;
}) {
  const router = useRouter();
  const { reportConversation, isPending } = useReportConversation({
    onSuccess: () => {
      setOpen(false);
      router.push("/forum");
    },
  });

  const [open, setOpen] = useState(false);

  if (!me.canReportConversation(conversation)) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button className="inline-flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:text-purple-300">
              <Ban className="size-5" />
              <span className="sr-only">Signaler</span>
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent className="bg-foreground text-background border-0">
          Signaler la conversation
          <TooltipArrow className="fill-foreground" />
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogTitle>Signaler la conversation</DialogTitle>
        <DialogDescription className="sr-only">
          Confirmation avant le signalement de la conversation et de tous ses
          messages
        </DialogDescription>
        <div className="flex flex-col gap-2 leading-5">
          <p>
            Vous êtes sur le point de signaler la conversation{" "}
            <strong className="uppercase">{conversation.title}</strong>, créée
            par <strong>{conversation.createdBy.pseudo}</strong>, ainsi que tous
            les messages qu&apos;elle contient.
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
            className="bg-opacity-50 hover:bg-opacity-30 border-red-500 bg-red-900 text-red-500 hover:border-red-500 hover:bg-red-900 hover:text-red-600"
            onClick={() => {
              reportConversation(conversation.id);
            }}
          >
            Signaler
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
