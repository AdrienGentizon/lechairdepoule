import {
  ButtonHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export function Form({
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

export function FormGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    ></div>
  );
}

export function Label({
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
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({
  variant,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  variant?: "secondary";
}) {
  return (
    <input
      className={cn(
        "w-full rounded-sm border border-white bg-black px-2 py-0.5 font-light",
        variant === "secondary" && "border-black bg-white text-black",
        className
      )}
      {...props}
    />
  );
}

export function Button({
  variant,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "secondary";
}) {
  return (
    <button
      className={cn(
        "hover:not:disabled:bg-white/25 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-white px-8 py-0.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50",
        variant === "secondary" &&
          "hover:not:disabled:bg-gray-700 border border-black bg-black text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
