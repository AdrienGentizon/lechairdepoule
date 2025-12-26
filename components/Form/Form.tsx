import {
  FormHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export function FormField({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  );
}

export function FieldError({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-red-600", className)}
      aria-disabled={!children}
      {...props}
    >
      {children}
    </p>
  );
}

export function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "pb-0.5 text-sm font-semibold aria-required:after:content-['*']",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "rounded-sm border border-black px-2 py-0.5 text-sm font-light text-black selection:bg-black selection:text-white",
        className
      )}
      {...props}
    />
  );
}

export default function Form({
  className,
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </form>
  );
}
