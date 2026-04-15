"use client";

import { UserCircle } from "lucide-react";
import Link from "next/link";

import useMe from "@/lib/auth/useMe";
import useUserMentions from "@/lib/forum/useUserMentions";

function UserButton() {
  const { userMentions } = useUserMentions();

  return (
    <Link
      href={`/user`}
      className="origin-center scale-[1.5] cursor-pointer hover:scale-[1.525] portrait:scale-[1.25]"
    >
      <UserCircle className="stroke-white stroke-1" aria-hidden />
      <span
        className="sr-only"
        aria-live="polite"
      >{`Mes notifications - ${userMentions.length} non lues`}</span>
      {userMentions.length > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex size-3 scale-75 items-center justify-center rounded-full bg-red-500 font-mono text-[0.5rem] text-white"
          aria-hidden
        >
          {userMentions.length}
        </span>
      )}
    </Link>
  );
}

export default function Fetcher() {
  const { me } = useMe();

  if (!me) return null;

  return <UserButton />;
}
