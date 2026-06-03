import { ReactNode, useState } from "react";

import Loader from "@/components/Loader/Loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Me } from "@/lib/auth/useMe";
import useBanUser from "@/lib/forum/useBanUser";

type BanTarget = { id: string; pseudo: string; bannedAt: string | null };
type Props = {
  me: Me;
  user: BanTarget;
  children: ReactNode;
  className?: string;
};

export default function BanUserTrigger({
  me,
  user,
  children,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const { banUser, isPending } = useBanUser();

  if (!me.canBanUser(user)) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={className}>
        {children}
      </DialogTrigger>
      <DialogContent className="grid max-h-[90dvh] w-full max-w-[90dvw] grid-cols-1 grid-rows-[min-content_1fr_min-content] gap-0 overflow-hidden rounded-sm border border-gray-500 bg-white p-0 text-black landscape:max-w-96">
        <DialogHeader className="bg-black p-4 text-white">
          <DialogTitle>Bannir un utilisateur</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire pour bannir un utilisateur de la plateforme
          </DialogDescription>
        </DialogHeader>
        <div className="bg-white p-2">
          <p>
            Vous êtes sur le point de dénoncer un message de{" "}
            <strong>{user.pseudo}</strong>.
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
            disabled={isPending}
            onClick={() => {
              banUser(user.id, { onSuccess: () => setOpen(false) });
            }}
          >
            <span className="relative">
              Bannir <strong>{user.pseudo}</strong>
              {isPending && <Loader />}
            </span>
          </button>
          <button
            className="w-full rounded-sm border border-black bg-white py-0.5 text-center text-black hover:bg-neutral-100"
            onClick={() => setOpen(false)}
          >
            Fermer
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
