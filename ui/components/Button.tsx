import { ComponentProps } from "react";

import { type VariantProps, cva } from "class-variance-authority";

export const buttonClassName = cva(
  "inline-flex h-fit text-sm font-medium rounded-sm cursor-pointer items-center justify-center gap-1 border px-8 py-1 disabled:cursor-default disabled:opacity-50 aria-disabled:cursor-default aria-disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-neutral-800 text-neutral-100 border-neutral-400 hover:border-purple-300 hover:bg-purple-950 hover-text-purple-100",
        secondary:
          "bg-neutral-100 text-neutral-900 border-neutral-100  hover:border-purple-300 hover:bg-purple-50 hover:text-purple-500",
        danger: "bg-red-400 text-background border-red-400",
        muted: "border-neutral-100 bg-neutral-50 text-neutral-600",
        icon: "p-1 w-fit",
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
