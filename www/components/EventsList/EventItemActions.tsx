"use client";

import useMe from "@/lib/auth/useMe";
import { Event } from "@/lib/types";

export default function EventItemActions({ event }: { event: Event }) {
  const { me } = useMe();

  if (event.createdBy.id !== me?.id) return null;

  const cmsEventUrl = `${process.env.NEXT_PUBLIC_CMS_URL}/organizations/${event.organizationId}/events/${event.id}`;

  return (
    <div className="absolute bottom-0 flex w-full items-center justify-end gap-1 px-2 py-1">
      <a
        href={cmsEventUrl}
        className="text-xs text-neutral-200 underline hover:text-purple-300"
      >
        modifier
      </a>
    </div>
  );
}
