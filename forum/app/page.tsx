"use client";
import {
  ComponentProps,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  useState,
} from "react";

import z from "zod";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import "@/lib/zod";

function Field({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col [&:has(:required)_label]:after:content-['*']",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("font-semibold", className)} {...props}>
      {children}
    </label>
  );
}

function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "rounded-sm border border-neutral-300 bg-neutral-800 px-2 py-0.5 font-light text-white outline-none selection:bg-white selection:text-black placeholder:text-gray-300 focus:border-purple-300",
        className
      )}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  id: string;
}) {
  return (
    <p
      aria-live="polite"
      className={cn("min-h-lh text-sm font-medium text-red-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function InputField({
  id,
  name,
  labelProps,
  onFocus,
  error,
  resetErrorOnFocus,
  ...inputProps
}: Omit<ComponentProps<typeof Input>, "id" | "name"> & {
  id: string;
  name: string;
  labelProps: Omit<ComponentProps<typeof Label>, "htmlFor"> | undefined;
  error: string | undefined;
  resetErrorOnFocus: (() => void) | undefined;
}) {
  return (
    <Field>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <Input
        id={id}
        name={name}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-invalid={error !== undefined}
        onFocus={(e) => {
          resetErrorOnFocus?.();
          onFocus?.(e);
        }}
        {...inputProps}
      />
      <FieldError id={`${name}-error`}>{error}</FieldError>
    </Field>
  );
}

export default function Home() {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
  }>({});

  const resetInputError = (key: keyof typeof errors) => {
    setErrors((prev) => {
      return {
        ...prev,
        [key]: undefined,
      };
    });
  };

  return (
    <main className="flex w-full max-w-2xl flex-col">
      <h1>Forum</h1>
      <form
        id="sign-in"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();

          if (!email) {
            const parsedInputs = z
              .object({ email: z.string().email() })
              .safeParse(
                Object.fromEntries(new FormData(e.currentTarget).entries())
              );
            if (!parsedInputs.success) {
              return setErrors({
                email: parsedInputs.error.flatten().fieldErrors.email?.at(0),
              });
            }
            const { data, error } =
              await authClient.emailOtp.sendVerificationOtp({
                email: parsedInputs.data.email,
                type: "sign-in",
              });

            console.log({ data, error });
            return setEmail(parsedInputs.data.email);
          }

          const parsedInputs = z
            .object({ otp: z.string().length(6).regex(/^\d+$/) })
            .safeParse(
              Object.fromEntries(new FormData(e.currentTarget).entries())
            );
          if (!parsedInputs.success) {
            return setErrors({
              otp: parsedInputs.error.flatten().fieldErrors.otp?.at(0),
            });
          }
          const { data, error } = await authClient.signIn.emailOtp({
            email,
            otp: parsedInputs.data.otp,
          });
          return console.log({ data, error });
        }}
      >
        <InputField
          id="email"
          name="email"
          type="email"
          required
          disabled={typeof email === "string"}
          error={errors.email}
          labelProps={{
            children: <>email</>,
          }}
          resetErrorOnFocus={() => {
            resetInputError("email");
          }}
        />

        <InputField
          id="otp"
          name="otp"
          required
          disabled={!email}
          error={errors.otp}
          labelProps={{
            children: <>code de vérication</>,
          }}
          resetErrorOnFocus={() => {
            resetInputError("otp");
          }}
        />

        <button type="submit" form="sign-in" className="cursor-pointer">
          Sign in
        </button>
      </form>
    </main>
  );
}
