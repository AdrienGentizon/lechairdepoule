"use client";

import { CalendarIcon } from "lucide-react";

type ICS = { title: string; startsAt: string; endsAt?: string | null };

function buildHref(ics: ICS) {
  const params = new URLSearchParams({
    title: ics.title,
    startsAt: ics.startsAt,
  });
  if (ics.endsAt) params.set("endsAt", ics.endsAt);

  return `/api/ics?${params.toString()}`;
}

export default function ImportToCalendarButton({ ics }: { ics: ICS }) {
  const params = new URLSearchParams({
    title: ics.title,
    startsAt: ics.startsAt,
  });
  if (ics.endsAt) params.set("endsAt", ics.endsAt);

  return (
    <a
      href={buildHref(ics)}
      className="absolute right-4 top-4 -translate-y-1/2"
    >
      <CalendarIcon className="size-5" />
      <span className="sr-only">Ajouter {ics.title} à mon calendrier</span>
    </a>
  );
}
