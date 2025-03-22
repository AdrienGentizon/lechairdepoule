import Link from "next/link";
import Logo from "../Logo/logo";
import isDevPlatform from "@/lib/isDevPlatform";

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
    <header className="w-full border-l border-r border-neutral-800 pb-4 sm:max-w-2xl">
      <Logo className="mx-auto w-1/2 pb-2 pt-4" />
      {isDevPlatform() && (
        <nav>
          <ul className="flex items-center justify-center gap-4 text-sm font-light uppercase">
            <li>
              <Link href={`/`}>Animations</Link>
            </li>
            <li>
              <Link href={`/drugstore`}>Drugstore</Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

Header.Title = Title;
