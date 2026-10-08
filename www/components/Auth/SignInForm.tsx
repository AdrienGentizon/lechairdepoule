"use client";

import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  SignInIcon,
} from "@phosphor-icons/react";

import { useState, useTransition } from "react";

import z from "zod";

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
        return setErrors({ submit: [response.error] });
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

      <Button type="submit" className="mt-2 uppercase" disabled={isPending}>
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
  const [errors, setErrors] = useState<{
    otp?: string[];
    submit?: string[];
    resend?: string[];
  }>({});

  const resend = () => {
    startResendTransition(async () => {
      const response = await sendOTPToEmail({ email });

      if (!response.success) {
        return setErrors({ resend: [response.error] });
      }

      console.log("OTP resent");
    });
  };

  const submit = (form: HTMLFormElement) => {
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
        return setErrors({ submit: [response.error] });
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
        required
        autoFocus
        errors={[errors.submit, errors.resend, errors.otp].flat()}
        hint={
          <div className="flex flex-col">
            <span>
              {`Le code a été envoyé à`} <strong>{email}</strong>.
            </span>
            <Button
              type="button"
              variant="text"
              className="ml-auto text-xs text-neutral-600"
              disabled={isBusy}
              onClick={onChangeEmail}
            >
              {`Oups, changer l'email ?`}
            </Button>
          </div>
        }
        onResetError={() => setErrors({})}
      />

      <div className="mt-2 flex flex-col gap-2">
        <Button type="submit" className="uppercase" disabled={isBusy}>
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
        <Button
          type="button"
          variant="text"
          className="mx-auto w-fit text-xs text-neutral-600"
          disabled={isBusy}
          onClick={resend}
        >
          {`Renvoyer un code`}
        </Button>
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
