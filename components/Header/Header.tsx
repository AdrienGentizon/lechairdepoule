import Link from "next/link";

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
      <Title />
      <nav>
        <ul className="flex items-center justify-center gap-4 text-sm font-light uppercase">
          <li>
            <Link href={`/`}>Animations</Link>
          </li>
          <li>
            <Link
              href={`https://www.etsy.com/fr/shop/ChairdePoule`}
              target="_blank"
            >
              Magasin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

Header.Title = Title;
