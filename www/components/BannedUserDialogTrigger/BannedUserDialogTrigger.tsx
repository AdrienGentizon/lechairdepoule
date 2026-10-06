import { ComponentProps, useState } from "react";

import useSubmitBanAppeal from "@/lib/forum/useSubmitBanAppeal";
import { BanAppealFormSchema } from "@/lib/schemas";

import Button from "../Button/Button";
import AugmentedTextarea from "../ChatRoom/SubmitMessageForm/AugmentedTextarea/AugmentedTextarea";
import Form, {
  FieldError,
  FormField,
  Label,
  inputClassName,
} from "../Form/Form";
import Loader from "../Loader/Loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function BanAppealForm() {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const {
    submitBanAppeal,
    error: submitError,
    isPending,
  } = useSubmitBanAppeal();

  if (submitted) {
    return (
      <p className="rounded-sm border border-green-400 bg-green-950 px-2 py-1 text-green-400">{`Votre message a bien été transmis à l'équipe de modération.`}</p>
    );
  }

  return (
    <Form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);

        const parsed = BanAppealFormSchema.safeParse({ body });
        if (!parsed.success) {
          return setError(parsed.error.flatten().fieldErrors.body?.[0]);
        }

        submitBanAppeal(parsed.data.body, {
          onSuccess: () => setSubmitted(true),
        });
      }}
    >
      <FormField>
        <Label htmlFor="ban-appeal-body" aria-required>
          Message
        </Label>
        <AugmentedTextarea
          id="ban-appeal-body"
          name="body"
          className={inputClassName("min-h-20")}
          placeholder="Expliquez pourquoi vous pensez qu'il s'agit d'une erreur..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <FieldError>{error}</FieldError>
      </FormField>
      <Button type="submit" disabled={isPending} className="self-end">
        Envoyer
        {isPending && <Loader position="relative" />}
      </Button>
      {submitError && (
        <FieldError className="mt-2 rounded-sm border border-red-500 bg-red-500/15 px-2 text-center">
          {submitError.message ??
            "Erreur inconnue, veuillez réessayer ou nous signaler un bug."}
        </FieldError>
      )}
    </Form>
  );
}

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
        <BanAppealForm />
      </DialogContent>
    </Dialog>
  );
}
