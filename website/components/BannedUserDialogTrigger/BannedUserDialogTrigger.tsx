import { ComponentProps } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function BannedUserDialogTrigger({
  children,
  ...props
}: ComponentProps<typeof DialogTrigger>) {
  return (
    <Dialog>
      <DialogTrigger {...props}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opération non autorisée</DialogTitle>
          <DialogDescription
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >{`L'envoi de message avec ce compte n'est pas autorisé`}</DialogDescription>
        </DialogHeader>
        {`Il semble que vous ayez enfreint les règles du forum. Si vous pensez qu'il s'agit d'une erreur de notre part, contactez l'équipe de modération pour en discuter.`}
      </DialogContent>
    </Dialog>
  );
}
