"use client";

import { PlusCircleIcon } from "@phosphor-icons/react";

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
import useOrganizationEvents from "@/components/event/useOrganizationEvents";
import useT from "@/components/i18n/useT";
import Main from "@/components/layout/Main";
import PageHeader from "@/components/layout/PageHeader";

const TOS_HREF = "https://lechairdepoule.fr/forum/cgu";

const EVENT_TYPE_TITLES = {
  EVENT: "Nouvel événement",
  RELEASE: "Nouvelle sortie",
} satisfies Record<Event["type"], string>;

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
        <p>Organisation introuvable</p>
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
            Créer un événement
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>
              {step.name === "EVENT_INPUTS"
                ? EVENT_TYPE_TITLES[step.eventType]
                : "Créer un événement"}
            </Dialog.Title>
            <Dialog.Description
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {step.name === "EVENT_INPUTS"
                ? "Étape 2 sur 2 : remplir les informations"
                : "Étape 1 sur 2 : choisir le type d'événement"}
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
                  <Details.Summary className="grid grid-cols-[5rem_1fr] gap-2 pr-4">
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
                    <p className="font-courier text-sm">
                      {event.publishedAt ? "publié" : "brouillon"} ·{" "}
                      {event.visibility}
                    </p>
                    <Link
                      href={`/organizations/${organization.id}/events/${event.id}`}
                      className="self-end text-sm hover:underline"
                    >
                      modifier
                      <span className="sr-only"> {event.title}</span>
                    </Link>
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
