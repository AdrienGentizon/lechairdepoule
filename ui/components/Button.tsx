import { ComponentProps } from "react";

import { type VariantProps, cva } from "class-variance-authority";

export const buttonClassName = cva(
  "inline-flex rounded-sm cursor-pointer items-center justify-center gap-1 border px-8 py-1 disabled:cursor-default disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-background text-foreground border-foreground",
        secondary: "bg-foreground text-background border-foreground",
        danger: "bg-red-400 text-background border-red-400",
        muted: "border-neutral-100 bg-neutral-50 text-neutral-600",
        text: "text-foreground border-none bg-transparent p-0 underline",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export default function Button({
  className,
  variant,
  children,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonClassName>) {
  return (
    <button className={buttonClassName({ variant, className })} {...props}>
      {children}
    </button>
  );
}
