import { ComponentProps, ReactNode } from "react";

import cn from "../lib/cn";

export function Label({
  className,
  children,
  ...props
}: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-bold leading-loose", className)}
      {...props}
    >
      {children}
    </label>
  );
}

export function ErrorMessage({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-courier text-pretty text-sm leading-loose text-red-400",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function HintMessage({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "font-courier text-pretty text-sm leading-loose",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function HintOrErrorMessage({
  id,
  hint,
  errors,
}: {
  id: string;
  hint?: ReactNode;
  errors: string[];
}) {
  return (
    <>
      <HintMessage id={`hints--${id}`} aria-live="polite">
        {hint}
      </HintMessage>
      <ErrorMessage id={`errors--${id}`} role="alert">
        {errors.length > 0 ? errors.join(", ") : <>&nbsp;</>}
      </ErrorMessage>
    </>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "font-courier w-full min-w-0 rounded-sm border border-neutral-300 bg-neutral-950 px-2 py-1 read-only:cursor-default read-only:caret-transparent read-only:opacity-50 disabled:opacity-50",
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
      <Label htmlFor={id} hidden={props.type === "hidden"}>
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
      {props.type !== "hidden" && (
        <HintOrErrorMessage id={id} hint={hint} errors={errors} />
      )}
    </div>
  );
}
