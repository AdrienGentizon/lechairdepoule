"use client";

import { UserCircle } from "lucide-react";

import useUserMentions from "@/lib/forum/useUserMentions";

export default function UserButton() {
  const { userMentions } = useUserMentions();
  return (
    <button className="absolute right-[50%] top-4 z-20 origin-center translate-x-80 scale-[1.5] hover:scale-[1.525] portrait:right-[0.75rem] portrait:top-[0.75rem] portrait:translate-x-0 portrait:scale-[1.25]">
      <UserCircle className="stroke-white stroke-1" aria-hidden />
      <span
        className="sr-only"
        aria-live="polite"
      >{`Mes notifications - ${userMentions.length} non lues`}</span>
      <span
        className="absolute -right-0.5 -top-0.5 flex size-3 scale-75 items-center justify-center rounded-full bg-red-500 font-mono text-[0.5rem] text-white"
        aria-hidden
      >
        {userMentions.length}
      </span>
    </button>
  );
}
