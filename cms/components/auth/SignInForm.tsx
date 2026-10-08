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
import dictionaries from "@/components/auth/dictionaries";
import { useLocale } from "@/components/i18n/LocaleProvider";
import useT from "@/components/i18n/useT";
import errorDictionaries from "@/lib/i18n/dictionaries/errors";

function EmailForm({
  defaultEmail,
  className,
  onOTPSent,
}: {
  defaultEmail: string | undefined;
  className?: string;
  onOTPSent: (email: string) => void;
}) {
  const locale = useLocale();
  const zodError = z.locales[locale]().localeError;
  const dictionary = useT(dictionaries);
  const errorDictionary = useT(errorDictionaries);

  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{
    email?: string[];
    submit?: string[];
  }>({});

  const submit = (form: HTMLFormElement) => {
    const parsedInputs = z
      .object({ email: z.email().max(254) })
      .safeParse(Object.fromEntries(new FormData(form).entries()), {
        error: zodError,
      });

    if (!parsedInputs.success) {
      return setErrors(z.flattenError(parsedInputs.error).fieldErrors);
    }

    startTransition(async () => {
      const response = await sendOTPToEmail({
        email: parsedInputs.data.email,
      });

      if (!response.success) {
        return setErrors({ submit: [errorDictionary[response.error]] });
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
        label={dictionary.email_label}
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
        {dictionary.continue}
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
}: {
  email: string;
  className?: string;
  onChangeEmail: () => void;
}) {
  const locale = useLocale();
  const zodError = z.locales[locale]().localeError;
  const dictionary = useT(dictionaries);
  const errorDictionary = useT(errorDictionaries);

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
        return setErrors({ resend: [errorDictionary[response.error]] });
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
        error: zodError,
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
        return setErrors({ submit: [errorDictionary[response.error]] });
      }
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
        label={dictionary.otp_label}
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
              {dictionary.code_sent_to} <strong>{email}</strong>.
            </span>
            <Button
              type="button"
              variant="text"
              className="ml-auto text-xs text-neutral-600"
              disabled={isBusy}
              onClick={onChangeEmail}
            >
              {dictionary.wrong_email_hint}
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
          {dictionary.sign_in}
        </Button>
        <Button
          type="button"
          variant="text"
          className="mx-auto w-fit text-xs text-neutral-600"
          disabled={isBusy}
          onClick={resend}
        >
          {dictionary.resend_code}
        </Button>
      </div>
    </form>
  );
}

export default function SignInForm({ className }: { className?: string }) {
  const [state, setState] = useState<
    { step: "email"; email?: string } | { step: "otp"; email: string }
  >({ step: "email" });

  if (state.step === "otp") {
    return (
      <OTPForm
        email={state.email}
        className={className}
        onChangeEmail={() => setState({ step: "email", email: state.email })}
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
