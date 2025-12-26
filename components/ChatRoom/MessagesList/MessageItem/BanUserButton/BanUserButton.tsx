import { useState } from "react";

import { Loader, Skull } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useBanUser from "@/lib/forum/useBanUser";
import { Message } from "@/lib/types";

type Props = { message: Message };

export default function BanUserButton({ message }: Props) {
  const [openBan, setOpenBan] = useState(false);

  const { banUser, isPending: isPendingBanUser } = useBanUser();

  return (
    <Dialog open={openBan} onOpenChange={setOpenBan}>
      <DialogTrigger
        disabled={message.user.bannedAt !== null}
        className="inline-flex h-full items-center gap-1 rounded-t-sm border-l border-r border-t border-white px-2 hover:bg-neutral-600 disabled:hidden"
      >
        <Skull className="size-3" />
        Bannir
      </DialogTrigger>
      <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
        <DialogHeader className="bg-black p-4 text-white">
          <DialogTitle>Bannir un utilisateur</DialogTitle>
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
            disabled={isPendingBanUser}
            onClick={() => {
              banUser(message.user.id, {
                onSuccess: () => {
                  setOpenBan(false);
                },
              });
            }}
          >
            <span className="relative">
              Bannir <strong>{message.user.pseudo}</strong>
              {isPendingBanUser && (
                <Loader className="absolute left-0 top-1/2 -ml-5 -mt-2 size-4 animate-spin" />
              )}
            </span>
          </button>

          <button
            className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-neutral-100"
            onClick={() => {
              setOpenBan(false);
            }}
          >
            Fermer
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
