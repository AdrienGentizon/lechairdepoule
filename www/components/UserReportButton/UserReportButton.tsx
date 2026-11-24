"use client";

import { ButtonHTMLAttributes, useState } from "react";

import { MessageCircleQuestion } from "lucide-react";

import Dialog from "@cdp/ui/Dialog";

import LogInButton from "@/components/Auth/LogInButton";
import BannedUserDialogTrigger from "@/components/BannedUserDialogTrigger/BannedUserDialogTrigger";
import useMe from "@/lib/auth/useMe";
import useSubmitUserReport from "@/lib/forum/useSubmitUserReport";
import { UserReportFormSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import Button from "../Button/Button";
import AugmentedTextarea from "../ChatRoom/SubmitMessageForm/AugmentedTextarea/AugmentedTextarea";
import Form, {
  FieldError,
  FormField,
  Label,
  inputClassName,
} from "../Form/Form";
import Loader from "../Loader/Loader";

const USER_REPORT_TYPES = [
  { value: "BUG", label: "Signaler un bug" },
  { value: "QUESTION", label: "Poser une question" },
  { value: "FEATURE", label: "Proposer une fonctionnalité" },
] as const;

function UserReportButtonContent({
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      className={cn(
        "scale-100 cursor-pointer rounded-full border-transparent transition-all hover:scale-110 hover:border-purple-400 hover:bg-purple-900 landscape:border-2 landscape:p-1",
        className,
      )}
      {...props}
    >
      <MessageCircleQuestion
        aria-hidden
        className="bg-background size-8 rounded-full stroke-purple-300"
      />
      <span className="sr-only">Nous contacter</span>
    </button>
  );
}

function UserReportForm() {
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const {
    submitUserReport,
    error: submitError,
    isPending,
  } = useSubmitUserReport();

  if (submitted) {
    return (
      <p className="rounded-sm border border-green-400 bg-green-950 px-2 py-1 text-green-400">{`Merci, votre message a bien été transmis.`}</p>
    );
  }

  return (
    <Form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(undefined);

        const formData = new FormData(e.currentTarget);
        const parsed = UserReportFormSchema.safeParse({
          type: formData.get("type"),
          body: formData.get("body"),
        });
        if (!parsed.success) {
          return setError(parsed.error.flatten().fieldErrors.body?.[0]);
        }

        submitUserReport(
          {
            type: parsed.data.type,
            body: parsed.data.body,
            pageUrl: window.location.href,
          },
          { onSuccess: () => setSubmitted(true) },
        );
      }}
    >
      <fieldset className="flex flex-col gap-1 py-2">
        <legend className="sr-only">Type de demande</legend>
        {USER_REPORT_TYPES.map((option) => (
          <FormField key={option.value} className="flex-row items-center gap-2">
            <input
              id={`user-report-${option.value}`}
              name="type"
              value={option.value}
              type="radio"
              className="cursor-pointer"
              defaultChecked={option.value === "BUG"}
            />
            <Label
              htmlFor={`user-report-${option.value}`}
              className="cursor-pointer pb-0"
            >
              {option.label}
            </Label>
          </FormField>
        ))}
      </fieldset>
      <FormField>
        <Label htmlFor="user-report-body" aria-required>
          Message
        </Label>
        <AugmentedTextarea
          id="user-report-body"
          name="body"
          className={inputClassName("min-h-20")}
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
          {submitError.message ?? "Erreur inconnue, veuillez réessayer."}
        </FieldError>
      )}
    </Form>
  );
}

function ActiveUserReportButton() {
  return (
    <Dialog>
      <Dialog.Trigger render={<UserReportButtonContent />} />
      <Dialog.Content className="landscape:max-w-xl">
        <Dialog.Title>Nous contacter</Dialog.Title>
        <Dialog.Description className="sr-only">
          Formulaire pour signaler un bug, poser une question ou proposer une
          fonctionnalité
        </Dialog.Description>
        <UserReportForm />
      </Dialog.Content>
    </Dialog>
  );
}

export default function UserReportButton() {
  const { me, isFetching } = useMe();

  if (isFetching) return null;
  if (!me) return <LogInButton render={<UserReportButtonContent />} />;
  if (me.bannedAt)
    return <BannedUserDialogTrigger render={<UserReportButtonContent />} />;
  return <ActiveUserReportButton />;
}
