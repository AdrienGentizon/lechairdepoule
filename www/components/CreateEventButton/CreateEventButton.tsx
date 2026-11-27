import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

export default function CreateEventButton() {
  return (
    <a
      href={process.env.NEXT_PUBLIC_CMS_URL}
      className="flex w-full items-center justify-center gap-2 px-4 py-3 font-light uppercase"
    >
      <PlusIcon size={24} weight="light" aria-hidden="true" />
      <span className="flex flex-col items-start">
        <span className="font-semibold">Créer un événement</span>
        <span className="text-muted-foreground text-xs normal-case">
          Concert · Release Party · Événement
        </span>
      </span>
    </a>
  );
}
