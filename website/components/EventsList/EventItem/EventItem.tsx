"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

import ContentfulImage from "@/components/ContentfulImage";
import ChairDePoule from "@/components/png/ChairDePoule";
import PeinePerdue from "@/components/png/PeinePerdue";
import { cn } from "@/lib/utils";
import { Event } from "@/queries/getEvents";

const LOCALE = "fr-FR";
const TZ = "Europe/Paris";

type Props = {
  event: Event;
};

export default function EventItem({ event }: Props) {
  const [open, setOpen] = useState(false);
  const top = useRef(0);

  useEffect(() => {
    const abortController = new AbortController();

    if (process.env["NEXT_PUBLIC_USE_SCROLL_TO"] === "true") {
      window.addEventListener(
        "event:select",
        (e: CustomEventInit<{ eventId: string }>) => {
          if (e.detail?.eventId !== event.sys.id) setOpen(false);
        },
        { signal: abortController.signal }
      );
    }

    return () => {
      abortController.abort();
    };
  }, [event, setOpen]);

  return (
    <li
      ref={(el) => {
        if (!el || top.current > 0) return;
        top.current = Math.floor(
          el.getBoundingClientRect().top - (window.innerWidth < 640 ? 128 : 162)
        );
      }}
      value={event.sys.id}
      className="relative flex w-full cursor-pointer flex-col gap-2 overflow-hidden border-b border-white py-2 first:border-t"
    >
      <button
        className="relative z-10 cursor-pointer p-0 hover:no-underline [&[data-state=open]>header+div]:opacity-0"
        onClick={() => {
          if (process.env["NEXT_PUBLIC_USE_SCROLL_TO"] === "true") {
            window.dispatchEvent(
              new CustomEvent("event:select", {
                detail: { eventId: event.sys.id },
              })
            );
            setTimeout(() => {
              window.scrollTo({
                top: top.current,
                behavior: "smooth",
              });
            }, 50);
          }
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("body:scrollHeight", {
                detail: { scrollHeight: document.body.scrollHeight },
              })
            );
          }, 100);
          setOpen((prev) => !prev);
        }}
      >
        <header
          role="button"
          className="grid w-full cursor-pointer grid-cols-[5rem_1fr] place-items-center gap-x-4 pr-4 transition-all"
        >
          <span className="sr-only">
            {[
              new Date(event.date).toLocaleDateString(LOCALE, {
                timeZone: TZ,
                weekday: "long",
                day: "numeric",
                month: "long",
              }),
              event.title,
              event.shortDescription,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
          <time
            aria-hidden
            dateTime={event.date.toISOString()}
            className="flex h-full min-h-16 flex-col items-center justify-center uppercase leading-none"
          >
            <span className="text-xs font-light leading-none">
              {new Date(event.date).toLocaleDateString(LOCALE, {
                timeZone: TZ,
                weekday: "short",
              })}
            </span>
            <span className="text-4xl font-black leading-none">
              {new Date(event.date).toLocaleDateString(LOCALE, {
                timeZone: TZ,
                day: "2-digit",
              })}
            </span>
            <span className="text-sm font-black leading-none">
              {new Date(event.date).toLocaleDateString(LOCALE, {
                timeZone: TZ,
                month: "short",
              })}
            </span>
          </time>
          <div aria-hidden className="flex w-full flex-col items-start">
            <h2 className="text-balance text-left text-xl font-light uppercase">
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
              "absolute right-0 top-1/2 z-50 origin-center -translate-y-1/2 rotate-12 scale-90 opacity-100 transition-opacity"
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
              <ContentfulImage
                className="mx-auto h-min rounded"
                alt=""
                src={event.picture.url}
                width={event.picture.width}
                height={event.picture.height}
                sizes="(max-width: 640px) 100dvw, 600px"
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
