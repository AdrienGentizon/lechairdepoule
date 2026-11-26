"use client";

import {
  PencilSimpleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import { useState } from "react";

import Link from "next/link";

import { LOCALE, getEventTime } from "@cdp/lib/date";
import dictionaries from "@cdp/lib/i18n/dictionaries/pages";
import { Event } from "@cdp/lib/types";
import Button from "@cdp/ui/Button";
import Details from "@cdp/ui/Details";
import DetailsScrollIntoViewOnOpen from "@cdp/ui/DetailsScrollIntoViewOnOpen";
import Dialog from "@cdp/ui/Dialog";
import EventSummary from "@cdp/ui/EventSummary";

import useMe from "@/components/auth/useMe";
import EventForm from "@/components/event/EventForm";
import SelectEventType from "@/components/event/SelectEventType";
import useCreateEvent from "@/components/event/useCreateEvent";
import useDeleteEvent from "@/components/event/useDeleteEvent";
import useOrganizationEvents from "@/components/event/useOrganizationEvents";
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
  const { deleteEvent } = useDeleteEvent(organizationId);

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
        <p className="text-center text-purple-100">
          {dictionary.empty_array_message}
        </p>
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
                  <Details.Summary className="group grid grid-cols-[5rem_1fr_auto] items-center gap-2 pr-4">
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
                    <div className="flex items-center gap-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
                      <Link
                        href={`/organizations/${organizationId}/events/${event.id}`}
                      >
                        <PencilSimpleIcon size={24} aria-hidden />
                        <span className="sr-only">
                          {dictionary.event_edit(event.title)}
                        </span>
                      </Link>
                      <button
                        type="button"
                        className="text-red-500 transition-colors hover:text-red-300"
                        onClick={() => {
                          if (
                            window.confirm(
                              dictionary.event_delete_confirm(event.title),
                            )
                          ) {
                            deleteEvent(event.id);
                          }
                        }}
                      >
                        <TrashIcon size={24} aria-hidden />
                        <span className="sr-only">
                          {dictionary.event_delete(event.title)}
                        </span>
                      </button>
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
