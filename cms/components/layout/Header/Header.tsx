"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header>
      <Link href={`/`}></Link>
      <nav>
        <ul></ul>
      </nav>
    </header>
  );
}
