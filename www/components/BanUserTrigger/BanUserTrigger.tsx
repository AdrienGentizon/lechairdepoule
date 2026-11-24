import { ReactElement, useState } from "react";

import Dialog from "@cdp/ui/Dialog";

import Loader from "@/components/Loader/Loader";
import { Me } from "@/lib/auth/useMe";
import useBanUser from "@/lib/forum/useBanUser";

type BanTarget = { id: string; pseudo: string; bannedAt: string | null };
type Props = {
  me: Me;
  user: BanTarget;
  children: ReactElement;
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
      <Dialog.Trigger render={children} className={className} />
      <Dialog.Content className="landscape:max-w-96">
        <Dialog.Title>Bannir un utilisateur</Dialog.Title>
        <Dialog.Description className="sr-only">
          Formulaire pour bannir un utilisateur de la plateforme
        </Dialog.Description>
        <div>
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
        <footer className="flex flex-col gap-1">
          <button
            className="hover:not:disabled:bg-neutral-700 w-full rounded-sm border border-white bg-black py-0.5 text-center text-white disabled:cursor-not-allowed disabled:opacity-50"
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
      </Dialog.Content>
    </Dialog>
  );
}
