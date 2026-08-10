"use client";
import { CheckIcon, DotOutlineIcon } from "@phosphor-icons/react";

import {
  ButtonHTMLAttributes,
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
        "rounded-sm border border-neutral-300 bg-neutral-50 px-2 py-0.5 font-light outline-none placeholder:text-gray-300 focus:border-purple-300 disabled:cursor-not-allowed",
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
    <Field className="has-disabled:opacity-50">
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

function Button({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "cursor-pointer rounded-sm border border-neutral-300 bg-neutral-100 px-4 py-0.5 font-medium",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type Progress =
  | {
      step: 0;
      label: "email";
      data: {
        email: undefined;
        code: undefined;
      };
    }
  | {
      step: 1;
      label: "code";
      data: {
        email: string;
        code: undefined;
      };
    }
  | {
      step: 2;
      label: "done";
      data: {
        email: string;
        code: string;
      };
    };

const initialProgress = {
  step: 0,
  label: "email",
  data: {
    email: undefined,
    code: undefined,
  },
} satisfies Progress;

function SigninProgress({ progress }: { progress: Progress }) {
  console.log(progress);
  return (
    <nav>
      <ol className="grid grid-flow-col p-4">
        {[
          {
            step: 0,
            label: "Email",
          },
          {
            step: 1,
            label: "Code",
          },
          {
            step: 2,
            label: "FIN.",
          },
        ].map((step) => {
          const validated = progress.step > step.step;
          const inProgress = progress.step === step.step;

          return (
            <li
              key={step.label}
              className="relative flex flex-col items-center justify-center first:*:before:hidden first:*:after:hidden"
              aria-current={progress.step === step.step ? "step" : undefined}
            >
              <div
                className={cn(
                  "relative flex w-full items-center justify-center",
                  "after:absolute after:right-0 after:top-1/2 after:-z-20 after:w-full after:-translate-x-1/2 after:translate-y-1/2 after:border-t after:border-neutral-300 after:content-['']",
                  "before:absolute before:right-0 before:top-1/2 before:-z-10 before:w-full before:origin-left before:-translate-x-1/2 before:translate-y-1/2 before:scale-x-0 before:border-t before:border-neutral-400 before:transition-transform before:duration-300 before:content-['']",
                  (validated || inProgress) &&
                    "before:scale-x-100 before:border-green-400"
                )}
              >
                <span
                  className={cn(
                    "flex aspect-square size-6 flex-col items-center justify-center rounded-full border p-1 transition-transform duration-300 ease-[cubic-bezier(0.34,3,0.64,1)]",
                    "scale-50 border-neutral-300 bg-neutral-50 text-neutral-500",
                    (inProgress || validated) &&
                      "scale-100 border-green-400 bg-green-200 text-green-600"
                  )}
                  aria-hidden="true"
                >
                  {validated ? (
                    <CheckIcon size={12} />
                  ) : (
                    <DotOutlineIcon size={16} className="fill-transparent" />
                  )}
                </span>
                <p
                  className={cn(
                    "absolute -bottom-1 translate-y-full text-xs font-semibold opacity-50",
                    validated && "opacity-100"
                  )}
                >
                  {step.label}{" "}
                  <span className="sr-only">
                    {validated ? "completed" : "in progress"}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function Home() {
  const [progress, setProgress] = useState<Progress>(initialProgress);

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
        className="mx-auto flex w-full max-w-md flex-col"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();

          if (progress.label === "email") {
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

            const { error } = await authClient.emailOtp.sendVerificationOtp({
              email: parsedInputs.data.email,
              type: "sign-in",
            });

            if (error) {
              return setErrors((prev) => {
                return {
                  ...prev,
                  email:
                    error.message ?? "uknown email error, please try again",
                };
              });
            }
            return setProgress({
              step: 1,
              label: "code",
              data: {
                email: parsedInputs.data.email,
                code: undefined,
              },
            });
          }

          if (progress.label === "code") {
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
            const { error } = await authClient.signIn.emailOtp({
              email: progress.data.email,
              otp: parsedInputs.data.otp,
            });
            if (error) {
              return setErrors((prev) => {
                return {
                  ...prev,
                  otp: error.message ?? "unknown verification code error",
                };
              });
            }
            return setProgress({
              step: 2,
              label: "done",
              data: {
                email: progress.data.email,
                code: parsedInputs.data.otp,
              },
            });
          }
        }}
      >
        <InputField
          id="email"
          name="email"
          type="email"
          required
          disabled={[, "code", "done"].includes(progress.label)}
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
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          required
          disabled={["signin", "email", "done"].includes(progress.label)}
          error={errors.otp}
          labelProps={{
            children: <>code de vérication</>,
          }}
          resetErrorOnFocus={() => {
            resetInputError("otp");
          }}
        />

        <Button
          type="submit"
          form="sign-in"
          className="mx-auto"
          disabled={progress.label === "done"}
        >
          {["signin", "email"].includes(progress.label) && "Me connecter"}
          {["code", "done"].includes(progress.label) && "Me connecter"}
        </Button>
      </form>
      <SigninProgress progress={progress} />
    </main>
  );
}
