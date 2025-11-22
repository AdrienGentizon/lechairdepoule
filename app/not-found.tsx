import Link from "next/link";

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found"
      className="mx-auto flex flex-col items-center justify-center gap-4 bg-black"
    >
      <h2 id="not-found" className="text-center font-mono font-medium">
        Désolé, cette page est introuvable
      </h2>
      <Link
        href={`/`}
        className="w-full rounded-sm border border-white py-1 text-center font-mono"
      >
        Retour
      </Link>
    </section>
  );
}
