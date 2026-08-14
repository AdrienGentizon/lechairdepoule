"use client";

import Markdown from "react-markdown";

import { LOCALE } from "@/lib/date";
import getContentfulEvents from "@/queries/getContentfulEvents";

import ContentfulImage from "../ContentfulImage";
import EventItem from "../EventsList/EventItem";

export default function ContentfulEventItem({
  event,
}: {
  event: Awaited<ReturnType<typeof getContentfulEvents>>[number];
}) {
  return (
    <EventItem
      key={event.id}
      variant={event.atPeinePerdue ? "PP" : "CDP"}
      summary={{
        title: event.title,
        description: event.shortDescription,
      }}
      event={event}
      image={
        event.coverUrl &&
        event.coverWidth &&
        event.coverHeight && (
          <ContentfulImage
            className="mx-auto h-min rounded"
            alt=""
            src={event.coverUrl}
            width={event.coverWidth}
            height={event.coverHeight}
            sizes="(max-width: 640px) 100dvw, 600px"
          />
        )
      }
      details={<Markdown>{event.description}</Markdown>}
      aria={{
        title: [
          event.title,
          new Date(event.startsAt).toLocaleDateString(LOCALE, {
            timeZone: event.timezone,
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
