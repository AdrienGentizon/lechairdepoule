import { ComponentProps, ReactNode } from "react";

import cn from "../lib/cn";

export function Label({
  className,
  children,
  ...props
}: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-0.5 text-sm font-medium leading-snug", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full min-w-0 border px-1.5 py-0.5 read-only:cursor-default read-only:caret-transparent read-only:opacity-50 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function InputField({
  id,
  label,
  hint,
  errors: errorsFromProps = [],
  suffix,
  onResetError,
  onChange,
  "aria-invalid": _,
  "aria-describedby": __,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  errors?: (string | undefined)[];
  suffix?: ReactNode;
  onResetError?: () => void;
  "aria-invalid"?: never;
  "aria-describedby"?: never;
}) {
  const errors = errorsFromProps.filter((error) => error !== undefined);

  return (
    <div className="flex flex-col">
      <Label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden>*</span>}
      </Label>
      <div className={cn(suffix && "grid w-full grid-cols-[1fr_auto]")}>
        <Input
          id={id}
          aria-describedby={`hints--${id} errors--${id}`}
          aria-invalid={errors.length > 0}
          onChange={(e) => {
            onChange?.(e);
            if (errors.length > 0) onResetError?.();
          }}
          {...props}
        />
        {suffix && (
          <div className="bg-foreground text-background">{suffix}</div>
        )}
      </div>
      <div className="mt-1">
        <div
          id={`hints--${id}`}
          aria-live="polite"
          className="text-pretty text-sm leading-snug text-neutral-600"
        >
          {hint}
        </div>
        <p
          id={`errors--${id}`}
          role="alert"
          className="text-pretty text-sm leading-snug text-red-400"
        >
          {errors.length > 0 ? errors.join(", ") : <>&nbsp;</>}
        </p>
      </div>
    </div>
  );
}
