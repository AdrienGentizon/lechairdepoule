import { useState } from "react";

import { Ban } from "lucide-react";

import Loader from "@/components/Loader/Loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useReportMessage from "@/lib/forum/useReportMessage";
import { Message } from "@/lib/types";

type Props = { message: Message };

export default function ReportMessageButton({ message }: Props) {
  const [openReport, setOpenReport] = useState(false);

  const { reportMessage, isPending: isPendingReportMessage } =
    useReportMessage();

  return (
    <Dialog open={openReport} onOpenChange={setOpenReport}>
      <DialogTrigger
        disabled={message.reportedAt !== null || message.user.bannedAt !== null}
        className="inline-flex h-full items-center gap-1 rounded-t-sm border-l border-r border-t border-white px-2 hover:bg-neutral-600 disabled:hidden"
      >
        <Ban className="size-3" />
        Molo molo
      </DialogTrigger>
      <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-neutral-500 bg-white p-0 text-black landscape:max-w-96">
        <DialogHeader className="bg-black p-4 text-white">
          <DialogTitle>Dénoncer un message</DialogTitle>
        </DialogHeader>
        <div className="bg-white p-2">
          <p>
            Vous êtes sur le point de dénoncer un message de{" "}
            <strong>{message.user.pseudo}</strong>.
          </p>
          <p>
            Le message ne sera plus lisible, cependant son contenu sera conservé
            dans la base données.
          </p>
          <p>Voulez-vous poursuivre?</p>
        </div>
        <footer className="flex flex-col gap-1 p-2">
          <button
            className="hover:not:disabled:bg-neutral-700 w-full rounded-sm border border-black bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPendingReportMessage}
            onClick={() => {
              reportMessage(message.id, {
                onSuccess: () => {
                  setOpenReport(false);
                },
              });
            }}
          >
            <span className="relative">
              Dénoncer un message
              {isPendingReportMessage && <Loader position="relative" />}
            </span>
          </button>

          <button
            className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-neutral-100"
            onClick={() => {
              setOpenReport(false);
            }}
          >
            Fermer
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
