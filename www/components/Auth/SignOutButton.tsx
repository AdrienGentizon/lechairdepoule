"use client";

import { useQueryClient } from "@tanstack/react-query";

import { ComponentProps, useTransition } from "react";

import { useRouter } from "next/navigation";

import Button from "@cdp/ui/Button";

import signOut from "@/actions/auth/signOut";
import { CacheKey } from "@/lib/types";

export default function SignOutButton({
  children,
  disabled,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={disabled || isPending}
      onClick={(e) => {
        startTransition(async () => {
          await signOut();
          await queryClient.resetQueries({
            queryKey: ["me" satisfies CacheKey],
          });
          router.push("/forum");
        });
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
