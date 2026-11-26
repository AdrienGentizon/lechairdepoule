import { ComponentProps } from "react";

import cn from "../lib/cn";

export default function Toggle({
  checked,
  labelPosition = "left",
  className,
  children,
  ...props
}: ComponentProps<"button"> & {
  checked: boolean;
  labelPosition?: "left" | "right";
}) {
  return (
    <button
      type="button"
      role="switch"
      className={cn(
        "group inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50",
        labelPosition === "right" && "flex-row-reverse",
        className,
      )}
      aria-checked={checked}
      {...props}
    >
      {children}
      <span
        className={cn(
          "inline-flex w-6 rounded-full border border-neutral-100 bg-white p-px transition-colors",
          "after:size-2.5 after:rounded-full after:border after:border-neutral-300 after:bg-neutral-200 after:transition-transform after:content-['']",
          "group-aria-checked:bg-neutral-100 group-aria-checked:after:translate-x-2.5 group-aria-checked:after:border-neutral-500 group-aria-checked:after:bg-neutral-500",
        )}
        aria-hidden
      />
    </button>
  );
}
