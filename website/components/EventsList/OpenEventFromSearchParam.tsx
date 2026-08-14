"use client";

import { useEffect } from "react";

import { useSearchParams } from "next/navigation";

export default function OpenEventFromSearchParam() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");

  useEffect(() => {
    if (!eventId) return;

    const details = document.getElementById(eventId);
    if (!(details instanceof HTMLDetailsElement)) return;

    details.open = true;
  }, [eventId]);

  return null;
}
