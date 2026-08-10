import Image from "next/image";

import { LOCALE, TZ, getEventTime } from "@/lib/date";
import { PublicConversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import ConversationUrl from "../ConversationsList/ConversationUrl";
import TextParser from "../TextParser";
import ImportToCalendarButton from "./ImportToCalendarButton";

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
      {sortedConversations.map((conversation) => (
        <li
          key={conversation.id}
          className="border-foreground border-b py-2 first:border-t"
        >
          <details name="events" className="relative cursor-pointer">
            <summary className="grid grid-cols-[5rem_1fr] gap-2 pr-4">
              <span className="sr-only">
                {[
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
                  .join(", ")}
              </span>
              <time
                aria-hidden
                dateTime={conversation.startsAt}
                className="flex h-full min-h-16 flex-col items-center justify-center uppercase leading-none"
              >
                <span className="text-xs font-light leading-none">
                  {new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: TZ,
                    weekday: "short",
                  })}
                </span>
                <span className="text-4xl font-black leading-none">
                  {new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: TZ,
                    day: "2-digit",
                  })}
                </span>
                <span className="text-sm font-black leading-none">
                  {new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: TZ,
                    month: "short",
                  })}
                </span>
              </time>
              <div
                aria-hidden
                className="flex flex-col justify-center gap-1.5 leading-none"
              >
                <span className="text-balance text-xl font-semibold uppercase leading-none">
                  {conversation.title}
                </span>

                <div className="flex flex-col gap-0.5">
                  {conversation.venue && (
                    <span className="font-light leading-none">
                      {conversation.venue}
                    </span>
                  )}
                  <span className="flex items-center leading-none text-purple-300">
                    {conversation.startsAt && (
                      <time dateTime={conversation.startsAt ?? undefined}>
                        {getEventTime(conversation.startsAt)}
                      </time>
                    )}
                    {conversation.startsAt && conversation.price && (
                      <>&nbsp;&middot;&nbsp;</>
                    )}
                    {conversation.price && (
                      <span className="leading-none">{conversation.price}</span>
                    )}
                  </span>
                </div>
              </div>
            </summary>
            <ImportToCalendarButton conversation={conversation} />
            <div className="relative isolate flex flex-col gap-4 p-4">
              {conversation.coverUrl &&
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
                )}
              {conversation.description && (
                <p className="font-courier whitespace-pre-wrap font-light leading-tight">
                  <TextParser text={conversation.description} />
                </p>
              )}
              <ConversationUrl
                conversation={conversation}
                hideIfInDescription
              />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
