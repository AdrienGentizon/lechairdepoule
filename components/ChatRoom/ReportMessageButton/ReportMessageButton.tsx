import { DialogHeader } from "@/components/ui/dialog";
import useReportMessage from "@/lib/hooks/useReportMessage";
import { Message } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Loader } from "lucide-react";
import { useState } from "react";

type Props = { message: Message };

export default function ReportMessageButton({ message }: Props) {
  const [openReport, setOpenReport] = useState(false);
  const [openBan, setOpenBan] = useState(false);

  const { reportMessage, isPending: isPendingReportMessage } =
    useReportMessage();

  return (
    <Dialog open={openReport} onOpenChange={setOpenReport}>
      <DialogTrigger className="rounded-t-sm border-l border-r border-t border-white px-2 hover:bg-gray-600">
        Molo molo
      </DialogTrigger>
      <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
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
            className="hover:not:disabled:bg-gray-700 w-full rounded-sm border border-black bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPendingReportMessage}
            onClick={() => {
              reportMessage(message.id);
            }}
          >
            <span className="relative">
              Dénoncer un message
              {isPendingReportMessage && (
                <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
              )}
            </span>
          </button>

          <button
            className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-gray-100"
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
