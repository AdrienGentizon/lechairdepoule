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

import sendOTP from "@/actions/auth/sendOTP";
import signInWithOTP from "@/actions/auth/signInWithOTP";

function EmailForm({
  defaultEmail,
  onOTPSent,
}: {
  defaultEmail: string | undefined;
  onOTPSent: (email: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{
    email?: string[];
    submit?: string[];
  }>({});

  const submit = (form: HTMLFormElement) => {
    const parsedInputs = z
      .object({ email: z.email().max(254) })
      .safeParse(Object.fromEntries(new FormData(form).entries()));

    if (!parsedInputs.success) {
      return setErrors(z.flattenError(parsedInputs.error).fieldErrors);
    }

    startTransition(async () => {
      const response = await sendOTP({
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
      className="flex w-full max-w-sm flex-col p-2"
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
        autoFocus={defaultEmail !== undefined}
        errors={[errors.submit, errors.email].flat()}
        onResetError={() => setErrors({})}
      />

      <Button type="submit" disabled={isPending}>
        Continue
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
  onChangeEmail,
}: {
  email: string;
  onChangeEmail: () => void;
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
      const response = await sendOTP({ email });

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
        otp: z.string().min(1, "required").max(6),
      })
      .safeParse(Object.fromEntries(new FormData(form).entries()));

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
    });
  };

  return (
    <form
      className="flex w-full max-w-sm flex-col p-2"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget);
      }}
    >
      <input type="hidden" name="email" value={email} />

      <InputField
        label={`Verification code`}
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
              We sent a code to <strong>{email}</strong>.
            </span>
            <Button
              type="button"
              variant="text"
              className="ml-auto text-xs text-neutral-600"
              disabled={isBusy}
              onClick={onChangeEmail}
            >
              Oops, wrong email?
            </Button>
          </div>
        }
        onResetError={() => setErrors({})}
      />

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isBusy}>
          {isPending ? (
            <ArrowsClockwiseIcon
              className="motion-safe:animate-spin"
              aria-hidden
            />
          ) : (
            <SignInIcon aria-hidden />
          )}
          Sign in
        </Button>
        <Button
          type="button"
          variant="text"
          className="mx-auto w-fit text-xs text-neutral-600"
          disabled={isBusy}
          onClick={resend}
        >
          Resend code
        </Button>
      </div>
    </form>
  );
}

export default function SignInForm() {
  const [state, setState] = useState<
    { step: "email"; email?: string } | { step: "otp"; email: string }
  >({ step: "email" });

  if (state.step === "otp") {
    return (
      <OTPForm
        email={state.email}
        onChangeEmail={() => setState({ step: "email", email: state.email })}
      />
    );
  }

  return (
    <EmailForm
      defaultEmail={state.email}
      onOTPSent={(email) => setState({ step: "otp", email })}
    />
  );
}
