"use client";

import dictionaries from "@cdp/lib/i18n/dictionaries/pages";
import Toggle from "@cdp/ui/Toggle";

import useMe from "@/components/auth/useMe";
import EventForm from "@/components/event/EventForm";
import useOrganizationEvent from "@/components/event/useOrganizationEvent";
import useUpdateEvent from "@/components/event/useUpdateEvent";
import useUpdateEventStatus from "@/components/event/useUpdateEventStatus";
import useT from "@/components/i18n/useT";
import Main from "@/components/layout/Main";
import PageHeader from "@/components/layout/PageHeader";

const TOS_HREF = "https://lechairdepoule.fr/forum/cgu";

export default function EventPage({
  organizationId,
  eventId,
}: {
  organizationId: string;
  eventId: string;
}) {
  const dictionary = useT(dictionaries);
  const { me } = useMe();
  const { event, error: errorEvent } = useOrganizationEvent(
    organizationId,
    eventId,
  );
  const { updateEvent, isPending, error } = useUpdateEvent(
    organizationId,
    eventId,
  );
  const { updateEventStatus, isPending: isStatusPending } =
    useUpdateEventStatus(organizationId);

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
    <Main className="grid min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)]">
      <PageHeader
        heading={event.title}

        navBack={{
          href: `/organizations/${organization.id}`,
          label: dictionary.nav_back(organization.name),
          landmarkLabel: dictionary.nav_back_landmark,
        }}
      >
        <Toggle
          checked={!event.deletedAt}
          labelPosition="right"
          disabled={isStatusPending}
          onClick={() =>
            updateEventStatus({
              eventId: event.id,
              status: event.deletedAt ? "PUBLISHED" : "UNPUBLISHED",
            })
          }
        >
          {dictionary.event_published}
        </Toggle>
      </PageHeader>
      <div className="relative mx-auto w-full max-w-3xl overflow-y-auto">
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
      </div>
    </Main>
  );
}
