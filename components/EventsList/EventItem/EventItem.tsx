"use client";
import { Event } from "@/app/queries/getEvents";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

type Props = {
  event: Event;
  showDetails: boolean;
  onSelect: (event: Event) => void;
};

export default function EventItem({ event, onSelect }: Props) {
  const date = new Date(event.date);
  const month = date.toLocaleString("fr", {
    month: "short",
  });

  return (
    <AccordionItem
      value={event.sys.id}
      className="flex flex-col gap-2 border-b border-white p-2 first:border-t"
    >
      <AccordionTrigger className="p-0 hover:no-underline" hideChevron>
        <header
          role="button"
          className="grid w-full cursor-pointer grid-cols-[1fr_9fr] place-items-center justify-items-start gap-x-4 transition-all"
          onClick={() => {
            onSelect(event);
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl">{date.getDate()}</span>
            <span className="flex origin-center pl-1 text-lg font-thin">
              {!month.endsWith(".") && (
                <span className="text-transparent">{`\u2024`}</span>
              )}
              {month}
              {!month.endsWith(".") && <span>{`\u2024`}</span>}
            </span>
          </div>
          <div className="flex w-full flex-col items-start">
            <h2 className="text-left text-xl font-light uppercase">
              {event.title}
            </h2>
            {event.shortDescription ? (
              <h3 className="text-sm font-light">{event.shortDescription}</h3>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        </header>
      </AccordionTrigger>
      <AccordionContent>
        {event.picture && (
          <Image
            className="mx-auto h-min rounded"
            alt=""
            src={event.picture.url}
            width={event.picture.width}
            height={event.picture.height}
          />
        )}
        <div className="flex flex-col gap-2 pb-4 text-justify font-mono font-light leading-5">
          {event.message.split("\n").map((p, n) => {
            return <p key={`item-${event.sys.id}-p-${n}`}>{p}</p>;
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
