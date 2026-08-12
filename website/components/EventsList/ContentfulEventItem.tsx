"use client";

import Markdown from "react-markdown";

import { LOCALE } from "@/lib/date";
import getEvents from "@/queries/getEvents";

import ContentfulImage from "../ContentfulImage";
import EventItem from "../EventsList/EventItem";

export default function ContentfulEventItem({
  event,
}: {
  event: Awaited<ReturnType<typeof getEvents>>[number];
}) {
  return (
    <EventItem
      key={event.sys.id}
      variant={event.atPeinePerdue ? "PP" : "CDP"}
      summary={{
        title: event.title,
        description: event.shortDescription,
      }}
      startsAt={event.date.toISOString()}
      timezone={event.timezone}
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
