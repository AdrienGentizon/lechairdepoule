"use client";

import { CalendarIcon } from "@phosphor-icons/react";

type ICS = {
  title: string;
  startDate: string;
  endDate: string | null;
  startsAt: string | null;
  endsAt: string | null;
};

function buildHref(ics: ICS) {
  const params = new URLSearchParams({
    title: ics.title,
    startDate: ics.startDate,
  });
  if (ics.endDate) params.set("endDate", ics.endDate);
  if (ics.startsAt) params.set("startsAt", ics.startsAt);
  if (ics.endsAt) params.set("endsAt", ics.endsAt);

  return `/api/ics?${params.toString()}`;
}

export default function ImportToCalendarButton({ ics }: { ics: ICS }) {
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
