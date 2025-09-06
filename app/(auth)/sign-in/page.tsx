"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ButtonHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  useState,
} from "react";

function Form({
  className,
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </form>
  );
}

function FormGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    ></div>
  );
}

function Label({
  className,
  "aria-required": ariaRequired,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      htmlFor="email"
      className={cn(
        "text-sm font-semibold",
        ariaRequired && "after:pl-1 after:content-['*']",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-sm border border-white bg-black px-2 py-0.5 font-light",
        className,
      )}
      {...props}
    />
  );
}

function Button({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex items-center justify-center gap-2 rounded-sm border border-white px-8 py-0.5 font-semibold hover:bg-white/25 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function SignInPage() {
  const otpLength = 6;

  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [formValidity, setFormValidity] = useState(false);

  if (step === "EMAIL")
    return (
      <section aria-labelledby="forum-signin">
        <h2
          id="forum-signin"
          className="py-2 text-center text-lg font-light uppercase"
        >
          M&apos;inscrire au forum
        </h2>
        <Form
          onChange={(e) => {
            setFormValidity(e.currentTarget.checkValidity());
          }}
          onSubmit={(e) => {
            e.preventDefault();
            console.log(new FormData(e.currentTarget));
            setStep("OTP");
            setFormValidity(false);
          }}
        >
          <FormGroup>
            <Label htmlFor="email" aria-required>
              Email
            </Label>
            <Input id="email" name="email" type="email" required />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="pseudo" aria-required>
              Pseudo
            </Label>
            <Input id="pseudo" name="pseudo" type="text" required />
          </FormGroup>
          <Button type="submit" disabled={!formValidity}>
            M&apos;inscrire
          </Button>
        </Form>
      </section>
    );

  return (
    <section aria-labelledby="forum-signin">
      <header className="mx-auto flex flex-col items-center justify-center gap-2 pb-4">
        <h2
          id="forum-signin"
          className="text-center text-lg font-light uppercase"
        >
          Confirmation de l&apos;email
        </h2>
        <p className="px-40 text-center font-light leading-4">
          Pour confirmer votre inscription, vous devez rentrer le numéro de
          validation reçu par email.
        </p>
      </header>
      <Form
        className="mx-auto max-w-60"
        onChange={(e) => {
          if (e.currentTarget.checkValidity() !== formValidity) return;
          setFormValidity(e.currentTarget.checkValidity());
        }}
        onSubmit={(e) => {
          e.preventDefault();
          console.log(new FormData(e.currentTarget));
        }}
      >
        <InputOTP
          id="otp"
          name="otp"
          maxLength={otpLength}
          minLength={otpLength}
          pattern={REGEXP_ONLY_DIGITS}
          onChange={(value) => {
            setFormValidity(value.length === otpLength);
          }}
        >
          <InputOTPGroup className="border-white text-white">
            <InputOTPSlot className="border-inherit" index={0} />
            <InputOTPSlot className="border-inherit" index={1} />
            <InputOTPSlot className="border-inherit" index={2} />
            <InputOTPSlot className="border-inherit" index={3} />
            <InputOTPSlot className="border-inherit" index={4} />
            <InputOTPSlot className="border-inherit" index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button type="submit" disabled={!formValidity}>
          Confirmer
        </Button>
      </Form>
    </section>
  );
}
