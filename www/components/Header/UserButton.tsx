"use client";

import { UserCircle, UserCircle2 } from "lucide-react";
import Link from "next/link";

import LogInButton from "@/components/Auth/LogInButton";
import useMe from "@/lib/auth/useMe";
import useUserNotifications from "@/lib/forum/useUserNotifications";

function UserButton() {
  const { unread } = useUserNotifications();

  return (
    <Link
      href={`/user`}
      className="text-foreground cursor-pointer hover:text-purple-300"
    >
      <UserCircle aria-hidden className="size-8" />
      <span
        className="sr-only"
        aria-live="polite"
      >{`Mes notifications - ${unread} non lues`}</span>
      {unread > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex size-3 items-center justify-center rounded-full bg-red-500 font-mono text-[0.5rem] text-white"
          aria-hidden
        >
          {unread}
        </span>
      )}
    </Link>
  );
}

function UnauthUserButton() {
  return (
    <LogInButton
      type="button"
      className="scale-100 cursor-pointer rounded-full border-2 border-transparent p-1 transition-all hover:scale-110 hover:border-purple-400 hover:bg-purple-900"
    >
      <UserCircle2
        aria-hidden
        className="b bg-background size-8 rounded-full stroke-purple-300"
      />
      <span className="sr-only">Se connecter</span>
    </LogInButton>
  );
}

function UnknownUserPlaceholder() {
  return (
    <span className="p-1">
      <UserCircle2
        aria-hidden
        className="bg-background size-8 rounded-full stroke-purple-300 opacity-50"
      />
    </span>
  );
}

export default function Fetcher() {
  const { me, isFetching, error } = useMe();

  if (isFetching) return null;
  if (!me && error) return <UnknownUserPlaceholder />;
  if (!me) return <UnauthUserButton />;

  return <UserButton />;
}
