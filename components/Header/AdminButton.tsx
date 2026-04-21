"use client";

import { Settings } from "lucide-react";
import Link from "next/link";

import useMe from "@/lib/auth/useMe";

export default function AdminButton() {
  const { me } = useMe();

  if (me?.role !== "admin") return null;

  return (
    <Link
      href={`/forum/admin`}
      className="stroke-foreground cursor-pointer hover:text-purple-300"
    >
      <Settings />
      <span className="sr-only">Espace d&appos;administration</span>
    </Link>
  );
}
