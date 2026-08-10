import { LOCALE, TZ, getEventTime } from "@/lib/date";
import { PublicConversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import EventItem from "./EventItem";
import ScrollIntoView from "./ScrollIntoView";

function EmptyMessage({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mx-auto max-w-sm bg-black p-4 pt-32 text-center text-white">
      <h2 className="text-lg font-bold leading-8">{heading}</h2>
      <p className="font-light">{body}</p>
    </div>
  );
}

export default function PublicEventsList({
  conversations,
}: {
  conversations: PublicConversation[];
}) {
  const sortedConversations = conversations.toSorted((a, b) => {
    return a.startsAt.localeCompare(b.startsAt);
  });

  if (sortedConversations.length === 0) {
    return (
      <EmptyMessage
        heading="Programme à venir"
        body="Les prochaines animations seront annoncées bientôt."
      />
    );
  }

  return (
    <ul
      className={cn(
        "flex min-h-0 scroll-pb-16 flex-col overflow-y-auto rounded-sm pb-4 pt-6",
        "mask-[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
      )}
    >
      {sortedConversations.map((conversation) => {
        return (
          <EventItem
            key={conversation.id}
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
            summary={{
              title: conversation.title,
              description: conversation.venue,
            }}
            startsAt={conversation.startsAt}
            price={conversation.price}
            conversation={conversation}
          />
        );
      })}
      <ScrollIntoView />
    </ul>
  );
}
