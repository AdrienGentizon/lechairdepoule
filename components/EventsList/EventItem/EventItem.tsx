"use client";

import { Event } from "@/queries/getEvents";

import Image from "next/image";
import { cn } from "@/lib/utils";
import PeinePerdue from "@/components/png/PeinePerdue";
import ChairDePoule from "@/components/png/ChairDePoule";
import Markdown from "react-markdown";
import { useEffect, useRef, useState } from "react";

type Props = {
  event: Event;
};

export default function EventItem({ event }: Props) {
  const [open, setOpen] = useState(false);
  const top = useRef(0);
  const month = event.date.toLocaleString("fr", {
    month: "short",
  });

  useEffect(() => {
    const abortController = new AbortController();
    window.addEventListener(
      "event:select",
      (e: CustomEventInit<{ eventId: string }>) => {
        if (e.detail?.eventId !== event.sys.id) setOpen(false);
      },
      abortController,
    );
    return () => abortController.abort();
  }, [event, setOpen]);

  return (
    <li
      ref={(el) => {
        if (!el || top.current > 0) return;
        top.current = Math.floor(
          el.getBoundingClientRect().top -
            (window.innerWidth < 640 ? 128 : 176),
        );
      }}
      value={event.sys.id}
      className="relative flex w-full flex-col gap-2 overflow-hidden border-b border-white p-2 first:border-t"
    >
      <button
        className="relative z-10 p-0 hover:no-underline [&[data-state=open]>header+div]:opacity-0"
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent("event:select", {
              detail: { eventId: event.sys.id },
            }),
          );
          window.scrollTo({
            top: top.current,
            behavior: "smooth",
          });
          setOpen((prev) => !prev);
        }}
      >
        <header
          role="button"
          className="grid w-full cursor-pointer grid-cols-[1fr_9fr] place-items-center justify-items-start gap-x-4 transition-all"
        >
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm font-light">
              {event.date
                .toLocaleDateString("fr-FR", { weekday: "short" })
                .replace(".", "")}
            </span>
            <span className="text-3xl font-semibold">
              {event.date.getDate().toString().padStart(2, "0")}
            </span>
            <span className="flex origin-center pl-1 text-sm font-light uppercase">
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
        {event.atPeinePerdue && (
          <div
            className={cn(
              "absolute right-0 top-0 z-50 origin-center -translate-y-5 translate-x-6 rotate-12 scale-50 opacity-100 transition-opacity",
            )}
          >
            <PeinePerdue className="size-20" />
          </div>
        )}
      </button>
      {open && (
        <div>
          <div className="relative">
            <h4 className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 rotate-45 bg-black px-32 pt-40 text-center text-lg font-light uppercase">
              {event.atPeinePerdue ? (
                <PeinePerdue className="size-28" />
              ) : (
                <ChairDePoule className="size-28" />
              )}
            </h4>

            {event.picture && (
              <Image
                className="mx-auto h-min rounded"
                alt=""
                src={event.picture.url}
                width={event.picture.width}
                height={event.picture.height}
              />
            )}
          </div>
          <div className="flex flex-col gap-2 py-4 text-justify font-mono font-light leading-5">
            <Markdown>{event.message}</Markdown>
          </div>
        </div>
      )}
    </li>
  );
}
