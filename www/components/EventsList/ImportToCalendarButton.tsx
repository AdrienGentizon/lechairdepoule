"use client";

import { CalendarIcon } from "@phosphor-icons/react";

type ICS = {
  title: string;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
};

function buildHref(ics: ICS) {
  const params = new URLSearchParams({
    title: ics.title,
    startDate: ics.startDate,
    timezone: ics.timezone,
  });
  if (ics.startTime) params.set("startTime", ics.startTime);
  if (ics.endDate) params.set("endDate", ics.endDate);
  if (ics.endTime) params.set("endTime", ics.endTime);

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
