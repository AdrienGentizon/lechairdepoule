import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import AgendaPNG from "@/public/agenda.png";
import ContactPNG from "@/public/contact.png";
import ForumPNG from "@/public/forum.png";
import HorsLesMursPNG from "@/public/hors-les-murs.png";

import LogoSite from "../png/LogoSite";
import HeaderClientLogic from "./HeaderClientLogic";

function Title() {
  return (
    <Link href={`/`}>
      <LogoSite />
    </Link>
  );
}

const navItems = [
  { href: "/", src: AgendaPNG, alt: "Agenda", "data-nav-link-overlay": "/" },
  {
    href: "/contact",
    src: ContactPNG,
    alt: "Contact",
    "data-nav-link-overlay": "/contact",
  },
  {
    href: "/forum",
    src: ForumPNG,
    alt: "Forum",
    "data-nav-link-overlay": "/forum",
  },
  {
    href: "/agenda",
    src: HorsLesMursPNG,
    alt: "Hors les murs",
    "data-nav-link-overlay": "/agenda",
  },
];

export default function Header({ variant }: { variant?: "relative" }) {
  return (
    <header
      className={cn(
        "portrait:max-w-dvw z-20 w-full bg-black pb-4 sm:max-w-2xl",
        variant === "relative" && "relative"
      )}
    >
      <Link href={`/`}>
        <LogoSite />
      </Link>
      <HeaderClientLogic />
      <nav aria-labelledby="nav-main-label">
        <span id="nav-main-label" className="sr-only">
          Navigation principale
        </span>
        <ul className="flex items-center justify-center gap-4 pt-4 text-sm font-light uppercase">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div className="relative">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    className="h-6 w-auto object-contain landscape:h-10"
                    aria-hidden
                  />
                  <div
                    data-nav-link-overlay={item["data-nav-link-overlay"]}
                    className="absolute inset-0 hidden bg-purple-300 mix-blend-multiply"
                  />
                </div>
                <span className="sr-only">{item.alt}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

Header.Title = Title;
