"use client";

import { useQueryClient } from "@tanstack/react-query";

import { ComponentProps, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import Button from "@cdp/ui/Button";
import { ErrorMessage } from "@cdp/ui/Form";

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
  const [error, setError] = useState<string>();

  return (
    <>
      <Button
        disabled={disabled || isPending}
        onClick={(e) => {
          startTransition(async () => {
            setError(undefined);
            try {
              await signOut();
            } catch {
              return setError(`déconnexion impossible, réessayez`);
            }
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
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
    </>
  );
}
