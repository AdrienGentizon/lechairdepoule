import Image from "next/image";
import Link from "next/link";

import UserButton from "@/components/layout/Header/UserButton";
import { getLocale } from "@/lib/i18n";
import AgendaPNG from "@/public/agenda.png";

export default async function Header() {
  const locale = await getLocale();

  return (
    <header className="relative flex w-full flex-col items-center justify-center p-2">
      <Link href={`/`}>
        <Image
          src={AgendaPNG}
          alt=""
          className="h-12 object-contain"
          aria-hidden
        />
        <span className="sr-only">Agenda</span>
      </Link>
      <nav>
        <ul></ul>
      </nav>
      <UserButton locale={locale} className="absolute right-4 top-4" />
    </header>
  );
}
