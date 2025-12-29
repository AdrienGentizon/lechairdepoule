import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function buttonClassName(className?: string) {
  return cn(
    "flex w-max cursor-pointer items-center justify-center gap-2 px-8 py-0.5 text-sm font-semibold disabled:cursor-not-allowed",
    "rounded-sm border border-white bg-neutral-800 text-white transition-colors",
    "hover:border-purple-300 hover:bg-neutral-950",
    "disabled:hover:border-neutral-300 disabled:hover:bg-neutral-800",
    className
  );
}

export default function Button({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "flex w-max cursor-pointer items-center justify-center gap-2 px-8 py-0.5 text-sm font-semibold disabled:cursor-not-allowed",
        "rounded-sm border border-white bg-neutral-800 text-white transition-colors",
        "hover:border-purple-300 hover:bg-neutral-950",
        "disabled:hover:border-neutral-300 disabled:hover:bg-neutral-800",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
