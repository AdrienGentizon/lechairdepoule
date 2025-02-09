"use client";
import { Event } from "@/app/queries/getEvents";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Asset, AssetFile } from "contentful";
import Image from "next/image";

type Props = {
  event: Event;
  showDetails: boolean;
  onSelect: (event: Event) => void;
};

export default function EventItem({ event, onSelect }: Props) {
  const date = new Date(event.fields.date);

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
            <span className="text-5xl">{date.getDate()}</span>
            <span className="flex origin-center pl-1 text-xl font-thin">
              <span className="text-transparent">{`\u2024`}</span>
              {date.toLocaleString("fr", {
                month: "short",
              })}
              <span>{`\u2024`}</span>
            </span>
          </div>
          <div className="flex w-full flex-col items-start">
            <h2 className="text-2xl font-semibold uppercase">
              {event.fields.title}
            </h2>
            {event.fields.shortDescription && (
              <h3 className="text-sm font-light">
                {event.fields.shortDescription}
              </h3>
            )}
          </div>
        </header>
      </AccordionTrigger>
      <AccordionContent>
        <Image
          className="h-min rounded"
          alt=""
          src={`https:${
            (event.fields.picture as Asset)?.fields.file?.url?.toString() ?? ""
          }`}
          width={
            ((event.fields.picture as Asset)?.fields.file as AssetFile)?.details
              ?.image?.width
          }
          height={
            ((event.fields.picture as Asset)?.fields.file as AssetFile)?.details
              ?.image?.height
          }
        />
        <div className="flex flex-col gap-2 pb-4 text-justify font-mono font-light leading-5">
          {event.fields.message.split("\n").map((p, n) => {
            return <p key={`item-${event.sys.id}-p-${n}`}>{p}</p>;
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
