"use client";

import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  SignInIcon,
} from "@phosphor-icons/react";

import { useState, useTransition } from "react";

import z from "zod";

import { toErrorMessage } from "@cdp/lib/errors";
import Button from "@cdp/ui/Button";
import { InputField } from "@cdp/ui/Form";
import cn from "@cdp/ui/cn";

import sendOTPToEmail from "@/actions/auth/sendOTPToEmail";
import signInWithOTP from "@/actions/auth/signInWithOTP";

function EmailForm({
  defaultEmail,
  className,
  onOTPSent,
}: {
  defaultEmail: string | undefined;
  className?: string;
  onOTPSent: (email: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{
    email?: string[];
    submit?: string[];
  }>({});

  const submit = (form: HTMLFormElement) => {
    if (isPending) return;

    const parsedInputs = z
      .object({ email: z.email().max(254).toLowerCase() })
      .safeParse(Object.fromEntries(new FormData(form).entries()), {
        error: z.locales.fr().localeError,
      });

    if (!parsedInputs.success) {
      return setErrors(z.flattenError(parsedInputs.error).fieldErrors);
    }

    startTransition(async () => {
      const response = await sendOTPToEmail({
        email: parsedInputs.data.email,
      });

      if (!response.success) {
        return setErrors({ submit: [toErrorMessage(response.error)] });
      }

      onOTPSent(parsedInputs.data.email);
    });
  };

  return (
    <form
      className={cn("flex flex-col p-2", className)}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        submit(e.currentTarget);
      }}
    >
      <InputField
        label={`Email`}
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={defaultEmail}
        autoFocus
        errors={[errors.submit, errors.email].flat()}
        onResetError={() => setErrors({})}
      />

      <Button
        type="submit"
        className="mt-2 uppercase"
        aria-disabled={isPending}
      >
        Continuer
        {isPending ? (
          <ArrowsClockwiseIcon
            className="motion-safe:animate-spin"
            aria-hidden
          />
        ) : (
          <ArrowRightIcon aria-hidden />
        )}
      </Button>
      <p role="status" className="sr-only">
        {isPending ? `Envoi du code…` : ""}
      </p>
    </form>
  );
}

function OTPForm({
  email,
  className,
  onChangeEmail,
  onSuccess,
}: {
  email: string;
  className?: string;
  onChangeEmail: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const isBusy = isPending || isResending;
  const [hasResent, setHasResent] = useState(false);
  const [errors, setErrors] = useState<{
    otp?: string[];
    submit?: string[];
    resend?: string[];
  }>({});

  const resend = () => {
    startResendTransition(async () => {
      const response = await sendOTPToEmail({ email });

      if (!response.success) {
        return setErrors({ resend: [toErrorMessage(response.error)] });
      }

      setErrors({});
      setHasResent(true);
    });
  };

  const submit = (form: HTMLFormElement) => {
    if (isBusy) return;

    const parsedInputs = z
      .object({
        email: z.email().max(254),
        otp: z.string().min(1).max(6),
      })
      .safeParse(Object.fromEntries(new FormData(form).entries()), {
        error: z.locales.fr().localeError,
      });

    if (!parsedInputs.success) {
      return setErrors(z.flattenError(parsedInputs.error).fieldErrors);
    }

    startTransition(async () => {
      const response = await signInWithOTP({
        email: parsedInputs.data.email,
        otp: parsedInputs.data.otp,
      });

      if (!response.success) {
        return setErrors({ submit: [toErrorMessage(response.error)] });
      }

      onSuccess();
    });
  };

  return (
    <form
      className={cn("flex flex-col p-2", className)}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        submit(e.currentTarget);
      }}
    >
      <input type="hidden" name="email" value={email} />

      <InputField
        label={"Code de vérification"}
        id="otp"
        name="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        className="font-courier"
        required
        autoFocus
        errors={[errors.submit, errors.otp, errors.resend].flat()}
        hint={
          <span>
            {hasResent
              ? `Un nouveau code a été envoyé à`
              : `Le code a été envoyé à`}{" "}
            <strong>{email}</strong>.
            <span className="inline-flex w-full items-center justify-center gap-4">
              <button
                type="button"
                className="underline"
                disabled={isBusy}
                onClick={onChangeEmail}
              >
                {`Changer l'email`}
              </button>
              {"ou"}
              <button
                type="button"
                className="underline"
                disabled={isBusy}
                onClick={resend}
              >
                {`Renvoyer un code`}
              </button>
            </span>
          </span>
        }
        onResetError={() => setErrors({})}
      />

      <div className="mt-2 flex flex-col gap-2">
        <Button type="submit" className="uppercase" aria-disabled={isBusy}>
          {isPending ? (
            <ArrowsClockwiseIcon
              className="motion-safe:animate-spin"
              aria-hidden
            />
          ) : (
            <SignInIcon aria-hidden />
          )}
          {`Se connecter`}
        </Button>
        <p role="status" className="sr-only">
          {isPending ? `Connexion en cours…` : ""}
        </p>
      </div>
    </form>
  );
}

export default function SignInForm({
  className,
  onSuccess,
}: {
  className?: string;
  onSuccess: () => void;
}) {
  const [state, setState] = useState<
    { step: "email"; email?: string } | { step: "otp"; email: string }
  >({ step: "email" });

  if (state.step === "otp") {
    return (
      <OTPForm
        email={state.email}
        className={className}
        onChangeEmail={() => setState({ step: "email", email: state.email })}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <EmailForm
      defaultEmail={state.email}
      className={className}
      onOTPSent={(email) => setState({ step: "otp", email })}
    />
  );
}
