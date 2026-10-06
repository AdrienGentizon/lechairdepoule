import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex flex-col items-center justify-center gap-4 bg-black">
      <h1 className="text-center font-mono font-medium">
        Désolé, cette page est introuvable
      </h1>
      <Link
        href={`/`}
        className="w-full rounded-sm border border-white py-1 text-center font-mono"
      >
        Retour
      </Link>
    </div>
  );
}
