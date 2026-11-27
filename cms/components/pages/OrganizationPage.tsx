"use client";

import {
  EyeClosedIcon,
  EyeIcon,
  PencilSimpleIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react";

import { useState } from "react";

import Link from "next/link";

import { LOCALE, getEventTime } from "@cdp/lib/date";
import dictionaries from "@cdp/lib/i18n/dictionaries/pages";
import { Event } from "@cdp/lib/types";
import Badge from "@cdp/ui/Badge";
import Button from "@cdp/ui/Button";
import Details from "@cdp/ui/Details";
import DetailsScrollIntoViewOnOpen from "@cdp/ui/DetailsScrollIntoViewOnOpen";
import Dialog from "@cdp/ui/Dialog";
import EventSummary from "@cdp/ui/EventSummary";

import useMe from "@/components/auth/useMe";
import EventForm from "@/components/event/EventForm";
import SelectEventType from "@/components/event/SelectEventType";
import useCreateEvent from "@/components/event/useCreateEvent";
import useOrganizationEvents from "@/components/event/useOrganizationEvents";
import useUpdateEventStatus from "@/components/event/useUpdateEventStatus";
import useT from "@/components/i18n/useT";
import Main from "@/components/layout/Main";
import PageHeader from "@/components/layout/PageHeader";

const TOS_HREF = "https://lechairdepoule.fr/forum/cgu";

export default function OrganizationPage({
  organizationId,
}: {
  organizationId: string;
}) {
  const dictionary = useT(dictionaries);
  const { me } = useMe();
  const { events } = useOrganizationEvents(organizationId);
  const { createEvent, isPending, error, reset } =
    useCreateEvent(organizationId);
  const { updateEventStatus, isPending: isStatusPending } =
    useUpdateEventStatus(organizationId);

  const [step, setStep] = useState<
    | { name: "HIDDEN" }
    | { name: "EVENT_TYPE" }
    | { name: "EVENT_INPUTS"; eventType: Event["type"] }
  >({ name: "HIDDEN" });

  if (!me) return null;

  const organization = me.organizations.find(({ id }) => id === organizationId);

  if (!organization) {
    return (
      <Main>
        <p>{dictionary.not_found(dictionary.organization)}</p>
      </Main>
    );
  }

  return (
    <Main>
      <PageHeader
        heading={organization.name}
        navBack={{
          label: dictionary.nav_back(dictionary.home_h1),
          landmarkLabel: dictionary.nav_back_landmark,
          href: `/`,
        }}
      >
        <Dialog
          open={step.name !== "HIDDEN"}
          onOpenChange={(open) => {
            reset();
            setStep(open ? { name: "EVENT_TYPE" } : { name: "HIDDEN" });
          }}
        >
          <Dialog.Trigger render={<Button />}>
            <PlusCircleIcon size={18} aria-hidden />
            {dictionary.event_create}
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>
              {step.name === "EVENT_INPUTS"
                ? dictionary.event_create_type_titles[step.eventType]
                : dictionary.event_create}
            </Dialog.Title>
            <Dialog.Description
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {step.name === "EVENT_INPUTS"
                ? dictionary.event_create_step_inputs
                : dictionary.event_create_step_type}
            </Dialog.Description>
            {step.name === "EVENT_TYPE" && (
              <SelectEventType
                onSelect={(eventType) =>
                  setStep({ name: "EVENT_INPUTS", eventType })
                }
              />
            )}
            {step.name === "EVENT_INPUTS" && (
              <EventForm
                eventType={step.eventType}
                defaultVenue={
                  organization.type === "VENUE" ? organization.name : null
                }
                tosHref={TOS_HREF}
                isPending={isPending}
                error={error}
                onSubmit={(inputs, cover) => {
                  createEvent(
                    { inputs, cover },
                    { onSuccess: () => setStep({ name: "HIDDEN" }) },
                  );
                }}
              />
            )}
          </Dialog.Content>
        </Dialog>
      </PageHeader>
      {events.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {dictionary.events_empty_heading}
            </h2>
            <Button
              variant="text"
              onClick={() => {
                reset();
                setStep({ name: "EVENT_TYPE" });
              }}
            >
              {dictionary.events_empty}
            </Button>
          </div>
        </div>
      )}
      {events.length > 0 && (
        <ul role="list" className="flex flex-col pb-4 pt-6">
          {events.map((event) => {
            return (
              <li
                key={event.id}
                className="border-foreground relative isolate border-b py-2 first:border-t"
              >
                <Details id={event.id} name="events">
                  <Details.Summary className="grid grid-cols-[5rem_1fr_auto] items-center gap-2 pr-4">
                    <EventSummary
                      startDate={event.startDate}
                      startTime={event.startTime}
                      price={event.price}
                      title={event.title}
                      description={event.venue}
                      aria={{
                        title: [
                          event.title,
                          event.venue,
                          new Date(event.startDate).toLocaleDateString(LOCALE, {
                            timeZone: "UTC",
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          }),
                          event.startTime && getEventTime(event.startTime),
                          event.price,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      }}
                    />
                    <div className="flex flex-col items-end gap-6">
                      <Badge variant={event.deletedAt ? "warning" : "success"}>
                        {event.deletedAt
                          ? dictionary.event_archived
                          : dictionary.event_published}
                      </Badge>
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="text-neutral-300 transition-colors hover:text-purple-400"
                          type="button"
                          title={
                            event.deletedAt
                              ? dictionary.event_publish(event.title)
                              : dictionary.event_archive(event.title)
                          }
                          aria-pressed={!event.deletedAt}
                          disabled={isStatusPending}
                          onClick={() =>
                            updateEventStatus({
                              eventId: event.id,
                              status: event.deletedAt
                                ? "PUBLISHED"
                                : "UNPUBLISHED",
                            })
                          }
                        >
                          {event.deletedAt ? (
                            <EyeClosedIcon size={20} aria-hidden />
                          ) : (
                            <EyeIcon size={20} aria-hidden />
                          )}
                          <span className="sr-only">
                            {dictionary.event_published_aria(event.title)}
                          </span>
                        </button>
                        <Link
                          href={`/organizations/${organizationId}/events/${event.id}`}
                          className="text-neutral-300 hover:text-purple-400"
                          title={dictionary.event_edit(event.title)}
                        >
                          <PencilSimpleIcon size={22} aria-hidden />
                          <span className="sr-only">
                            {dictionary.event_edit(event.title)}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </Details.Summary>
                  <Details.Content>
                    {event.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.imageUrl}
                        width={event.imageWidth ?? undefined}
                        height={event.imageHeight ?? undefined}
                        alt=""
                        aria-hidden
                        className="mx-auto w-full object-cover"
                      />
                    )}
                    {event.description && (
                      <div className="font-courier whitespace-pre-wrap font-light leading-tight">
                        {event.description}
                      </div>
                    )}
                  </Details.Content>
                </Details>
              </li>
            );
          })}
          <DetailsScrollIntoViewOnOpen name="events" />
        </ul>
      )}
    </Main>
  );
}
