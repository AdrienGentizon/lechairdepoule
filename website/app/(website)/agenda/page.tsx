import { unstable_cache } from "next/cache";
import Image from "next/image";

import EventItem from "@/components/EventsList/EventItem";
import EventsList from "@/components/EventsList/EventsList";
import TextParser from "@/components/TextParser";
import {
  DANGEROUS_FALLBACK_TZ,
  LOCALE,
  getDateSpanUTC,
  getEventTime,
} from "@/lib/date";
import { getEventMainUrl } from "@/lib/events";
import selectEvents from "@/lib/events/selectEvents";
import selectConversationsByTypes from "@/lib/forum/selectConversationsByTypes";
import { getLogger } from "@/lib/logger";
import { CacheKey, Event } from "@/lib/types";

const getCachedConversationsAsEvents = unstable_cache(
  async () => {
    const logger = getLogger("getAgendaConversations");
    try {
      const conversations = await selectConversationsByTypes(
        ["EVENT", "RELEASE"],
        getDateSpanUTC().from.toISOString()
      );
      logger.append(`${conversations.length}x conversation(s) selected`);
      logger.flush();
      return conversations.map((conversation) => {
        return {
          ...conversation,
          updatedAt: new Date().toISOString(),
          timezone: conversation.timezone ?? DANGEROUS_FALLBACK_TZ,
        };
      });
    } catch (error) {
      logger.withError(error).flush();
      return [];
    }
  },
  ["cachedAgenda"],
  { tags: ["cachedAgenda"] satisfies CacheKey[], revalidate: 43200 }
);

const getCachedEvents = unstable_cache(
  async () => {
    const logger = getLogger("getAgendaEvents");
    try {
      const events = await selectEvents({
        from: getDateSpanUTC().from.toISOString(),
      });
      logger.append(`${events.length}x event(s) selected`);
      logger.flush();
      return events;
    } catch (error) {
      logger.withError(error).flush();
      return [];
    }
  },
  ["cachedEvents"],
  { tags: ["cachedEvents"] satisfies CacheKey[], revalidate: 43200 }
);

export default async function AgendaPage() {
  const migrationInProgress = true;

  const conversationsAsEvents = migrationInProgress
    ? await getCachedConversationsAsEvents()
    : [];
  const events = await getCachedEvents();

  const sortedConversations = [...conversationsAsEvents, ...events]
    .reduce((acc: Omit<Event, "createdBy">[], curr) => {
      if (
        acc.find(({ id }) => {
          return id === curr.id;
        })
      )
        return acc;
      return [...acc, curr];
    }, [])
    .toSorted((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <>
      <h1 className="sr-only">Agenda hors les murs</h1>
      <EventsList
        emptyMessage={{
          heading: "Programme à venir",
          body: "Les prochaines animations seront annoncées bientôt.",
        }}
      >
        {sortedConversations.map((conversation) => {
          return (
            <EventItem
              key={conversation.id}
              summary={{
                title: conversation.title,
                description: conversation.venue,
              }}
              url={getEventMainUrl({
                url: conversation.url,
                description: conversation.description,
              })}
              image={
                conversation.coverUrl &&
                conversation.coverWidth &&
                conversation.coverHeight && (
                  <Image
                    src={conversation.coverUrl}
                    width={conversation.coverWidth}
                    height={conversation.coverHeight}
                    alt=""
                    aria-hidden
                    className="mx-auto w-full object-cover"
                    sizes="(max-width: 640px) 100dvw, 600px"
                  />
                )
              }
              details={
                conversation.description && (
                  <TextParser text={conversation.description} />
                )
              }
              startsAt={conversation.startsAt}
              timezone={conversation.timezone}
              price={conversation.price}
              aria={{
                title: [
                  conversation.title,
                  conversation.venue,
                  new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: conversation.timezone,
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }),
                  getEventTime(conversation.startsAt, conversation.timezone),
                  conversation.price,
                ]
                  .filter(Boolean)
                  .join(", "),
              }}
            />
          );
        })}
      </EventsList>
    </>
  );
}
