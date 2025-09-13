import Link from "next/link";
import LogoSite from "../png/LogoSite";
import AgendaPNG from "@/public/agenda.png";
import DrugstorePNG from "@/public/drugstore.png";
import ContactPNG from "@/public/contact.png";
import ForumPNG from "@/public/forum.png";
import Image from "next/image";
import { cn } from "@/lib/utils";

function Title() {
  return (
    <Link href={`/`}>
      <LogoSite className="mx-auto w-1/2 pb-2 pt-4" />
    </Link>
  );
}

export default function Header({ variant }: { variant?: "relative" }) {
  return (
    <header
      className={cn(
        "fixed z-20 w-full bg-black pb-4 sm:max-w-2xl",
        variant === "relative" && "relative",
      )}
    >
      <Link href={`/`}>
        <LogoSite className="mx-auto w-1/2 pb-2 pt-4" />
      </Link>
      <nav>
        <ul className="flex items-center justify-center gap-4 pt-4 text-sm font-light uppercase">
          <li>
            <Link href={`/`}>
              <Image
                src={AgendaPNG}
                alt="Agenda"
                className="h-6 object-contain landscape:h-10"
                role="button"
              />
              <span className="sr-only">Agenda</span>
            </Link>
          </li>
          {process.env["NEXT_PUBLIC_SHOW_STORE"] === "true" && (
            <li>
              <Link href={`/drugstore`}>
                <Image
                  src={DrugstorePNG}
                  alt="Drugstore"
                  className="h-6 object-contain landscape:h-10"
                  role="button"
                />
                <span className="sr-only">Drugstore</span>
              </Link>
            </li>
          )}
          <li>
            <Link href={`/contact`}>
              <Image
                src={ContactPNG}
                alt="Contact"
                className="h-6 object-contain landscape:h-10"
                role="button"
              />
              <span className="sr-only">Contact</span>
            </Link>
          </li>
          <li>
            <Link href={`/forum`}>
              <Image
                src={ForumPNG}
                alt="Forum"
                className="h-6 object-contain landscape:h-10"
                role="button"
              />
              <span className="sr-only">Forum</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

Header.Title = Title;
