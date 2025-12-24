import { ButtonHTMLAttributes } from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "flex cursor-pointer items-center justify-center gap-2 rounded-sm px-8 py-0.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-black bg-white text-black hover:bg-gray-100 disabled:hover:bg-transparent",
        secondary:
          "border border-white bg-black text-white hover:bg-black/90 disabled:hover:bg-black",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

type Props = VariantProps<typeof buttonVariants>;

export default function Button({
  variant,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Props) {
  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          className,
        })
      )}
      {...props}
    >
      {children}
    </button>
  );
}
