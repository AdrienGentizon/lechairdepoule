"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";

import Link from "next/link";

import useMe from "@/components/auth/useMe";
import EventForm from "@/components/event/EventForm";
import useOrganizationEvent from "@/components/event/useOrganizationEvent";
import useUpdateEvent from "@/components/event/useUpdateEvent";
import Main from "@/components/layout/Main";

const TOS_HREF = "https://lechairdepoule.fr/forum/cgu";

export default function EventPage({
  organizationId,
  eventId,
}: {
  organizationId: string;
  eventId: string;
}) {
  const { me } = useMe();
  const { event, error: errorEvent } = useOrganizationEvent(
    organizationId,
    eventId,
  );
  const { updateEvent, isPending, error } = useUpdateEvent(
    organizationId,
    eventId,
  );

  if (!me) return null;

  const organization = me.organizations.find(({ id }) => id === organizationId);

  if (!organization || errorEvent) {
    return (
      <Main>
        <p>{errorEvent?.message ?? "Organisation introuvable"}</p>
      </Main>
    );
  }

  if (!event) return null;

  return (
    <Main className="grid min-h-0 max-w-2xl grid-cols-1 grid-rows-[auto_auto_minmax(0,1fr)]">
      <nav>
        <Link
          href={`/organizations/${organization.id}`}
          className="inline-flex items-center gap-2 hover:underline"
        >
          <ArrowLeftIcon size={18} aria-hidden />
          {organization.name}
        </Link>
      </nav>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-thin uppercase">{event.title}</h1>
        <p className="font-courier text-sm">
          {event.type === "EVENT" ? "Événement" : "Sortie"} ·{" "}
          {event.publishedAt ? "publié" : "brouillon"} · {event.visibility}
        </p>
      </header>
      <EventForm
        key={event.updatedAt}
        eventType={event.type}
        defaultValue={event}
        tosHref={TOS_HREF}
        isPending={isPending}
        error={error}
        onSubmit={({ type: _, ...inputs }, cover) => {
          updateEvent({ inputs, cover });
        }}
      />
    </Main>
  );
}
