"use client";

import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  SignInIcon,
} from "@phosphor-icons/react";

import { useState, useTransition } from "react";

import z from "zod";

import dictionaries from "@cdp/lib/i18n/dictionaries/auth";
import { toErrorMessage } from "@cdp/lib/i18n/utils";
import { Locale, Result } from "@cdp/lib/types";

import cn from "../../lib/cn";
import Button from "../Button";
import { InputField } from "../Form";

function EmailForm({
  locale,
  sendOTPToEmail,
  defaultEmail,
  className,
  onOTPSent,
}: {
  locale: Locale;
  sendOTPToEmail: (inputs: { email: string }) => Promise<Result<null>>;
  defaultEmail: string | undefined;
  className?: string;
  onOTPSent: (email: string) => void;
}) {
  const dictionary = dictionaries[locale];
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
        error: z.locales[locale]().localeError,
      });

    if (!parsedInputs.success) {
      return setErrors(z.flattenError(parsedInputs.error).fieldErrors);
    }

    startTransition(async () => {
      const response = await sendOTPToEmail({
        email: parsedInputs.data.email,
      });

      if (!response.success) {
        return setErrors({ submit: [toErrorMessage(response.error, locale)] });
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

      <Button
        type="submit"
        className="mt-2 uppercase"
        aria-disabled={isPending}
      >
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
      <p role="status" className="sr-only">
        {isPending ? dictionary.sending_code : ""}
      </p>
    </form>
  );
}

function OTPForm({
  locale,
  sendOTPToEmail,
  signInWithOTP,
  email,
  className,
  onChangeEmail,
  onSuccess,
}: {
  locale: Locale;
  sendOTPToEmail: (inputs: { email: string }) => Promise<Result<null>>;
  signInWithOTP: (inputs: {
    email: string;
    otp: string;
  }) => Promise<Result<null>>;
  email: string;
  className?: string;
  onChangeEmail: () => void;
  onSuccess?: () => void;
}) {
  const dictionary = dictionaries[locale];
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
        return setErrors({ resend: [toErrorMessage(response.error, locale)] });
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
        error: z.locales[locale]().localeError,
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
        return setErrors({ submit: [toErrorMessage(response.error, locale)] });
      }

      onSuccess?.();
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
        label={dictionary.otp_label}
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
            {hasResent ? dictionary.new_code_sent_to : dictionary.code_sent_to}{" "}
            <strong>{email}</strong>.
            <span className="inline-flex w-full items-center justify-center gap-4">
              <button
                type="button"
                className="underline"
                disabled={isBusy}
                onClick={onChangeEmail}
              >
                {dictionary.change_email}
              </button>
              {dictionary.or}
              <button
                type="button"
                className="underline"
                disabled={isBusy}
                onClick={resend}
              >
                {dictionary.resend_code}
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
          {dictionary.sign_in}
        </Button>
        <p role="status" className="sr-only">
          {isPending ? dictionary.signing_in : ""}
        </p>
      </div>
    </form>
  );
}

export default function SignInForm({
  locale,
  sendOTPToEmail,
  signInWithOTP,
  className,
  onSuccess,
}: {
  locale: Locale;
  sendOTPToEmail: (inputs: { email: string }) => Promise<Result<null>>;
  signInWithOTP: (inputs: {
    email: string;
    otp: string;
  }) => Promise<Result<null>>;
  className?: string;
  onSuccess?: () => void;
}) {
  const [state, setState] = useState<
    { step: "email"; email?: string } | { step: "otp"; email: string }
  >({ step: "email" });

  if (state.step === "otp") {
    return (
      <OTPForm
        locale={locale}
        sendOTPToEmail={sendOTPToEmail}
        signInWithOTP={signInWithOTP}
        email={state.email}
        className={className}
        onChangeEmail={() => setState({ step: "email", email: state.email })}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <EmailForm
      locale={locale}
      sendOTPToEmail={sendOTPToEmail}
      defaultEmail={state.email}
      className={className}
      onOTPSent={(email) => setState({ step: "otp", email })}
    />
  );
}
