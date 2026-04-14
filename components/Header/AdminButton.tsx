"use client";

import { Settings } from "lucide-react";
import Link from "next/link";

import useMe from "@/lib/auth/useMe";

export default function AdminButton() {
  const { me } = useMe();

  console.log(me);
  if (me?.role !== "admin") return null;

  return (
    <Link
      href={`/forum/admin`}
      className="origin-center scale-[1.5] hover:scale-[1.525] portrait:scale-[1.25]"
    >
      <Settings className="stroke-foreground size-6 stroke-1" />
      <span className="sr-only">Espace d&appos;administration</span>
    </Link>
  );
}
