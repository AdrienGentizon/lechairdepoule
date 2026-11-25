"use client";

import { PlusCircleIcon } from "@phosphor-icons/react";

import { useState } from "react";

import Link from "next/link";

import dictionaries from "@cdp/lib/i18n/dictionaries/pages";
import Button from "@cdp/ui/Button";
import Dialog from "@cdp/ui/Dialog";
import Table from "@cdp/ui/Table";

import useMe from "@/components/auth/useMe";
import EventForm from "@/components/event/EventForm";
import SelectEventType from "@/components/event/SelectEventType";
import useCreateEvent from "@/components/event/useCreateEvent";
import useOrganizationEvents from "@/components/event/useOrganizationEvents";
import useT from "@/components/i18n/useT";
import Main from "@/components/layout/Main";
import { Event } from "@/lib/types";

const TOS_HREF = "https://lechairdepoule.fr/forum/cgu";

const EVENT_TYPE_TITLES = {
  EVENT: "Nouvel événement",
  RELEASE: "Nouvelle sortie",
} satisfies Record<Event["type"], string>;

function formatDate(date: string, time: string | null) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
  return time ? `${formattedDate}, ${time}` : formattedDate;
}

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
      <header className="inline-flex items-center justify-between">
        <h1 className="text-2xl font-thin uppercase">{organization.name}</h1>
        <Dialog
          open={step.name !== "HIDDEN"}
          onOpenChange={(open) => {
            reset();
            setStep(open ? { name: "EVENT_TYPE" } : { name: "HIDDEN" });
          }}
        >
          <Dialog.Trigger render={Button}>
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
      </header>
      <Table>
        <Table.Caption>Événements</Table.Caption>
        <Table.THead>
          <Table.TR>
            <Table.TH>titre</Table.TH>
            <Table.TH>date</Table.TH>
            <Table.TH>visibilité</Table.TH>
            <Table.TH>statut</Table.TH>
          </Table.TR>
        </Table.THead>
        <Table.TBody>
          {events.length === 0 && (
            <Table.TR>
              <Table.TD className="text-center text-purple-100" colSpan={4}>
                {dictionary.empty_array_message}
              </Table.TD>
            </Table.TR>
          )}
          {events.map((event) => {
            return (
              <Table.TR key={event.id}>
                <Table.TD>
                  <Link
                    href={`/organizations/${organization.id}/events/${event.id}`}
                    className="hover:underline"
                  >
                    {event.title}
                  </Link>
                </Table.TD>
                <Table.TD>
                  {formatDate(event.startDate, event.startTime)}
                </Table.TD>
                <Table.TD>{event.visibility}</Table.TD>
                <Table.TD>
                  {event.publishedAt ? "publié" : "brouillon"}
                </Table.TD>
              </Table.TR>
            );
          })}
        </Table.TBody>
      </Table>
    </Main>
  );
}
