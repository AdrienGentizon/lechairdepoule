"use client";

import Markdown from "react-markdown";

import { LOCALE, TZ } from "@/lib/date";
import { Event } from "@/queries/getEvents";

import ContentfulImage from "../ContentfulImage";
import EventItem from "../PublicEventsList/EventItem";

export default function ContentfulEventItem({ event }: { event: Event }) {
  return (
    <EventItem
      key={event.sys.id}
      variant={event.atPeinePerdue ? "PP" : undefined}
      summary={{
        title: event.title,
        description: event.shortDescription,
      }}
      startsAt={event.date.toISOString()}
      image={
        event.picture && (
          <ContentfulImage
            className="mx-auto h-min rounded"
            alt=""
            src={event.picture.url}
            width={event.picture.width}
            height={event.picture.height}
            sizes="(max-width: 640px) 100dvw, 600px"
          />
        )
      }
      url={null}
      price={null}
      details={<Markdown>{event.message}</Markdown>}
      aria={{
        title: [
          event.title,
          event.date.toLocaleDateString(LOCALE, {
            timeZone: TZ,
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
        ]
          .filter(Boolean)
          .join(", "),
      }}
    />
  );
}
