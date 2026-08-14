"use client";

import { Settings } from "lucide-react";
import Link from "next/link";

import useMe from "@/lib/auth/useMe";

export default function AdminButton() {
  const { me, isFetching } = useMe();

  if (isFetching) return null;
  if (me?.role !== "admin") return null;

  return (
    <Link
      href={`/forum/admin`}
      className="stroke-foreground cursor-pointer hover:text-purple-300"
    >
      <Settings className="size-8" />
      <span className="sr-only">Espace d&appos;administration</span>
    </Link>
  );
}
