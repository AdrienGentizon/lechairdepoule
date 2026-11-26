"use client";

import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import SignInForm from "@cdp/ui/auth/SignInForm";

import sendOTPToEmail from "@/actions/auth/sendOTPToEmail";
import signInWithOTP from "@/actions/auth/signInWithOTP";
import { CacheKey } from "@/lib/types";

export default function LogInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <main
      id="main"
      className="grid w-full grid-cols-1 grid-rows-[auto_1fr] place-items-center"
    >
      <h1 className="py-4 text-2xl font-thin uppercase">Se connecter</h1>
      <SignInForm
        locale="fr"
        sendOTPToEmail={sendOTPToEmail}
        signInWithOTP={signInWithOTP}
        className="h-full w-full max-w-sm justify-center"
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["me" satisfies CacheKey],
          });
          router.push("/forum");
        }}
      />
    </main>
  );
}
