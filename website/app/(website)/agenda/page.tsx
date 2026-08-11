import { unstable_cache } from "next/cache";
import Image from "next/image";

import EventItem from "@/components/EventsList/EventItem";
import EventsList from "@/components/EventsList/EventsList";
import RefreshOnFocus from "@/components/RefreshOnFocus/RefreshOnFocus";
import TextParser from "@/components/TextParser";
import { LOCALE, TZ, getEventTime } from "@/lib/date";
import { getEventMainUrl } from "@/lib/events";
import selectConversationsByTypes from "@/lib/forum/selectConversationsByTypes";
import { getLogger } from "@/lib/logger";
import { CacheKey } from "@/lib/types";

const getCachedAgendaConversations = unstable_cache(
  async () => {
    const logger = getLogger("getAgendaConversations");
    try {
      const conversations = await selectConversationsByTypes(
        ["EVENT", "RELEASE"],
        new Date()
      );
      logger.append(`${conversations.length}x conversation(s) selected`);
      logger.flush();
      return conversations;
    } catch (error) {
      logger.withError(error).flush();
      return [];
    }
  },
  ["cachedAgenda"],
  { tags: ["cachedAgenda"] satisfies CacheKey[], revalidate: 43200 }
);

export default async function AgendaPage() {
  const sortedConversations = (await getCachedAgendaConversations()).toSorted(
    (a, b) => {
      return a.startsAt.localeCompare(b.startsAt);
    }
  );

  return (
    <div className="grid grid-cols-1 grid-rows-1 overflow-hidden">
      <h1 className="sr-only">Agenda hors les murs</h1>
      <EventsList>
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
              price={conversation.price}
              aria={{
                title: [
                  conversation.title,
                  conversation.venue,
                  new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: TZ,
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }),
                  getEventTime(conversation.startsAt),
                  conversation.price,
                ]
                  .filter(Boolean)
                  .join(", "),
              }}
            />
          );
        })}
      </EventsList>
      <RefreshOnFocus />
    </div>
  );
}
