"use client";

import { useQueryClient } from "@tanstack/react-query";

import { ComponentProps, useState } from "react";

import Dialog from "@cdp/ui/Dialog";
import SignInForm from "@cdp/ui/auth/SignInForm";

import sendOTPToEmail from "@/actions/auth/sendOTPToEmail";
import signInWithOTP from "@/actions/auth/signInWithOTP";
import { CacheKey } from "@/lib/types";

export default function LogInButton({
  className,
  children,
  ...props
}: ComponentProps<typeof Dialog.Trigger>) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={className} {...props}>
        {children}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Se connecter</Dialog.Title>
        <SignInForm
          locale="fr"
          sendOTPToEmail={sendOTPToEmail}
          signInWithOTP={signInWithOTP}
          onSuccess={() => {
            setOpen(false);
            queryClient.invalidateQueries({
              queryKey: ["me" satisfies CacheKey],
            });
          }}
        />
      </Dialog.Content>
    </Dialog>
  );
}
