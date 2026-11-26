"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";

import { Event } from "@cdp/lib/types";
import Button from "@cdp/ui/Button";

const EVENT_TYPES = [
  {
    value: "EVENT",
    label: "Événement",
    description: "Annoncer un concert, une performance et autres événements...",
  },
  {
    value: "RELEASE",
    label: "Sortie",
    description: "Sortie de disque, fanzine, livre, bd...",
  },
] satisfies { value: Event["type"]; label: string; description: string }[];

export default function SelectEventType({
  onSelect,
}: {
  onSelect: (type: Event["type"]) => void;
}) {
  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = new FormData(e.currentTarget).get("event_type");
        const selectedType = EVENT_TYPES.find(({ value }) => value === input);
        if (!selectedType) return;
        onSelect(selectedType.value);
      }}
    >
      <fieldset className="flex flex-col py-4">
        <legend className="sr-only">Type d&apos;événement à créer</legend>
        {EVENT_TYPES.map((type) => {
          return (
            <div
              key={type.value}
              className="grid grid-cols-[auto_1fr] gap-4 border-b border-neutral-500 py-2 last:border-b-0"
            >
              <input
                id={`event-type-${type.value}`}
                name="event_type"
                value={type.value}
                type="radio"
                className="cursor-pointer accent-purple-300"
                defaultChecked={type.value === "EVENT"}
                aria-describedby={`event-type-${type.value}-description`}
              />
              <label
                htmlFor={`event-type-${type.value}`}
                className="flex cursor-pointer flex-col"
              >
                <span className="font-bold">{type.label}</span>
                <span
                  id={`event-type-${type.value}-description`}
                  className="font-courier text-sm font-light"
                >
                  {type.description}
                </span>
              </label>
            </div>
          );
        })}
      </fieldset>
      <footer className="text-right">
        <Button type="submit">
          Continuer
          <ArrowRightIcon size={18} aria-hidden />
        </Button>
      </footer>
    </form>
  );
}
