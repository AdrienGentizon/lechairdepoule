"use client";

import { useQueryClient } from "@tanstack/react-query";

import { ReactNode, useState, useTransition } from "react";

import z from "zod";

import sendOTPToEmail from "@/actions/auth/sendOTPToEmail";
import signInWithOTP from "@/actions/auth/signInWithOTP";
import Button from "@/components/Button/Button";
import Form, {
  FieldError,
  FieldHelper,
  FormField,
  Input,
  Label,
} from "@/components/Form/Form";
import Loader from "@/components/Loader/Loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CacheKey } from "@/lib/types";

function EmailForm({
  defaultEmail,
  onOTPSent,
}: {
  defaultEmail: string | undefined;
  onOTPSent: (email: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = (form: HTMLFormElement) => {
    const parsedInputs = z
      .object({ email: z.email({ message: "Email invalide" }).max(254) })
      .safeParse(Object.fromEntries(new FormData(form).entries()));

    if (!parsedInputs.success) {
      return setError(
        z.flattenError(parsedInputs.error).fieldErrors.email?.at(0),
      );
    }

    startTransition(async () => {
      const response = await sendOTPToEmail({
        email: parsedInputs.data.email,
      });

      if (!response.success) return setError(response.error);

      onOTPSent(parsedInputs.data.email);
    });
  };

  return (
    <Form
      noValidate
      onFocus={() => setError(undefined)}
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
    >
      <FormField>
        <Label htmlFor="sign-in-email">Email</Label>
        <Input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          autoFocus
        />
        <FieldError>{error}</FieldError>
      </FormField>
      <Button type="submit" className="w-full" disabled={isPending}>
        Recevoir un code
        {isPending && <Loader position="relative" />}
      </Button>
    </Form>
  );
}

function OTPForm({
  email,
  onChangeEmail,
  onSignedIn,
}: {
  email: string;
  onChangeEmail: () => void;
  onSignedIn: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const isBusy = isPending || isResending;
  const [error, setError] = useState<string | undefined>(undefined);

  const resend = () => {
    startResendTransition(async () => {
      const response = await sendOTPToEmail({ email });

      if (!response.success) return setError(response.error);
    });
  };

  const submit = (form: HTMLFormElement) => {
    const parsedInputs = z
      .object({
        otp: z
          .string()
          .min(1, { message: "Code requis" })
          .max(6, { message: "Code invalide" }),
      })
      .safeParse(Object.fromEntries(new FormData(form).entries()));

    if (!parsedInputs.success) {
      return setError(
        z.flattenError(parsedInputs.error).fieldErrors.otp?.at(0),
      );
    }

    startTransition(async () => {
      const response = await signInWithOTP({
        email,
        otp: parsedInputs.data.otp,
      });

      if (!response.success) return setError(response.error);

      onSignedIn();
    });
  };

  return (
    <Form
      noValidate
      onFocus={() => setError(undefined)}
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
    >
      <FormField>
        <Label htmlFor="sign-in-otp">Code</Label>
        <Input
          id="sign-in-otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
        />
        <FieldHelper className="text-xs font-light">
          {`Code envoyé à `}
          <strong>{email}</strong>
        </FieldHelper>
        <FieldError>{error}</FieldError>
      </FormField>
      <Button type="submit" className="w-full" disabled={isBusy}>
        Se connecter
        {isPending && <Loader position="relative" />}
      </Button>
      <div className="flex justify-between pt-1">
        <button
          type="button"
          className="cursor-pointer text-xs text-neutral-400 underline disabled:cursor-not-allowed"
          disabled={isBusy}
          onClick={onChangeEmail}
        >
          Changer d&apos;email
        </button>
        <button
          type="button"
          className="cursor-pointer text-xs text-neutral-400 underline disabled:cursor-not-allowed"
          disabled={isBusy}
          onClick={resend}
        >
          Renvoyer le code
        </button>
      </div>
    </Form>
  );
}

export default function SignInDialog({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<
    { step: "email"; email?: string } | { step: "otp"; email: string }
  >({ step: "email" });

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) setState({ step: "email", email: state.email });
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Se connecter</DialogTitle>
          <DialogDescription className="text-sm font-light">
            {state.step === "email"
              ? "Un code de connexion vous sera envoyé par email."
              : "Saisissez le code reçu par email."}
          </DialogDescription>
        </DialogHeader>
        {state.step === "email" ? (
          <EmailForm
            defaultEmail={state.email}
            onOTPSent={(email) => setState({ step: "otp", email })}
          />
        ) : (
          <OTPForm
            email={state.email}
            onChangeEmail={() =>
              setState({ step: "email", email: state.email })
            }
            onSignedIn={() => {
              setOpen(false);
              setState({ step: "email" });
              queryClient.invalidateQueries({
                queryKey: ["me" satisfies CacheKey],
              });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
