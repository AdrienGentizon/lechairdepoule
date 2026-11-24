import { ButtonHTMLAttributes, useState } from "react";

import { Ban } from "lucide-react";

import Dialog from "@cdp/ui/Dialog";

import LogInButton from "@/components/Auth/LogInButton";
import BannedUserDialogTrigger from "@/components/BannedUserDialogTrigger/BannedUserDialogTrigger";
import Loader from "@/components/Loader/Loader";
import { Me } from "@/lib/auth/useMe";
import { isReportableMessage } from "@/lib/forum/permissions";
import useReportMessage from "@/lib/forum/useReportMessage";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  me?: Me;
  message: Message;
};

function ReportMessageButtonContent({
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      className={cn(
        "disabled:hover:text-foreground inline-flex h-full cursor-pointer items-center gap-1 rounded-t-sm border-l border-r border-t border-white px-2 text-xs hover:text-purple-300 disabled:cursor-not-allowed disabled:opacity-75",
        className,
      )}
      {...props}
    >
      <Ban className="size-3" />
      Molo molo
    </button>
  );
}

function BannedUserReportMessageButton() {
  return <BannedUserDialogTrigger render={<ReportMessageButtonContent />} />;
}

function UnauthUserReportMessageButton() {
  return <LogInButton render={<ReportMessageButtonContent />} />;
}

function ActiveReportMessageButton({ message, me }: Props) {
  const [openReport, setOpenReport] = useState(false);

  const { reportMessage, isPending: isPendingReportMessage } =
    useReportMessage();

  return (
    <Dialog open={openReport} onOpenChange={setOpenReport}>
      <Dialog.Trigger
        disabled={!isReportableMessage(message, me)}
        render={<ReportMessageButtonContent />}
      />
      <Dialog.Content className="landscape:max-w-96">
        <Dialog.Title>Dénoncer un message</Dialog.Title>
        <Dialog.Description className="sr-only">
          Formulaire pour signaler un message inapproprié à la modération
        </Dialog.Description>
        <div>
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
        <footer className="flex flex-col gap-1">
          <button
            className="hover:not:disabled:bg-neutral-700 w-full rounded-sm border border-white bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPendingReportMessage}
            onClick={() => {
              reportMessage(message.id, {
                onSuccess: () => {
                  setOpenReport(false);
                },
              });
            }}
          >
            <span className="relative inline-flex items-center gap-4">
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
      </Dialog.Content>
    </Dialog>
  );
}

export default function ReportMessageButton({ me, message }: Props) {
  if (me?.bannedAt) return <BannedUserReportMessageButton />;
  if (!me) return <UnauthUserReportMessageButton />;
  return <ActiveReportMessageButton message={message} me={me} />;
}
