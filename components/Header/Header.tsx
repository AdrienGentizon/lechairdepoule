import Link from "next/link";
import Logo from "../Logo/logo";
import isDevPlatform from "@/lib/isDevPlatform";
import AgendaPNG from "./agenda.png";
import DrugstorePNG from "./drugstore.png";
import ContactPNG from "./contact.png";
import Image from "next/image";

function Title() {
  return (
    <Link href={`/`}>
      <h1 className="w-full py-2 text-center text-4xl font-thin uppercase">
        Le Chair de Poule
      </h1>
    </Link>
  );
}

export default function Header() {
  return (
    <header className="w-full pb-4 sm:max-w-2xl">
      <Link href={`/`}>
        <Logo className="mx-auto w-1/2 pb-2 pt-4" />
      </Link>
      {isDevPlatform() && (
        <nav>
          <ul className="flex cursor-pointer items-center justify-center gap-4 pt-4 text-sm font-light uppercase">
            <li>
              <Link href={`/`}>
                <Image
                  src={AgendaPNG}
                  alt="Agenda"
                  className="w-24 sm:w-40"
                  role="button"
                />
                <span className="sr-only">Agenda</span>
              </Link>
            </li>
            <li>
              <Link href={`/drugstore`}>
                <Image
                  src={DrugstorePNG}
                  alt="Drugstore"
                  className="w-24 sm:w-40"
                  role="button"
                />
                <span className="sr-only">Drugstore</span>
              </Link>
            </li>
            <li>
              <Link href={`/contact`}>
                <Image
                  src={ContactPNG}
                  alt="Contact"
                  className="w-24 sm:w-40"
                  role="button"
                />
                <span className="sr-only">Contact</span>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

Header.Title = Title;
