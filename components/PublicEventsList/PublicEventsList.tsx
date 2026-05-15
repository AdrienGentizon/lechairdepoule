import Image from "next/image";

import { PublicConversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import ConversationUrl from "../ConversationsList/ConversationUrl";
import TextParser from "../TextParser";

const LOCALE = "fr-FR";
const TZ = "Europe/Paris";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const hours = parseInt(
    date.toLocaleString(LOCALE, { timeZone: TZ, hour: "numeric" })
  );
  const minutes = parseInt(
    date.toLocaleString(LOCALE, { timeZone: TZ, minute: "numeric" })
  );
  if (hours === 0 && minutes === 0) return "minuit";
  return minutes === 0
    ? `${hours.toString().padStart(2, "0")}H`
    : `${hours.toString().padStart(2, "0")}H${minutes.toString().padStart(2, "0")}`;
}

export default function PublicEventsList({
  conversations,
}: {
  conversations: PublicConversation[];
}) {
  const sortedConversations = conversations.toSorted((a, b) => {
    return a.startsAt.localeCompare(b.startsAt);
  });
  return (
    <ul
      className={cn(
        "flex min-h-0 scroll-pb-16 flex-col overflow-y-auto rounded-sm py-4",
        "mask-[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
      )}
    >
      {sortedConversations.map((conversation) => (
        <li
          key={conversation.id}
          className="border-foreground border-b py-2 first:border-t"
        >
          <details className="cursor-pointer">
            <summary className="grid grid-cols-[100px_1fr] gap-2 pr-6">
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
                  formatTime(conversation.startsAt),
                  conversation.price,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
              <time
                aria-hidden
                dateTime={conversation.startsAt}
                className="flex h-full min-h-16 flex-col items-center justify-center leading-none uppercase"
              >
                <span className="text-xs leading-none font-light">
                  {new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: TZ,
                    weekday: "short",
                  })}
                </span>
                <span className="text-3xl leading-none font-black">
                  {new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: TZ,
                    day: "2-digit",
                  })}
                </span>
                <span className="text-sm leading-none font-bold">
                  {new Date(conversation.startsAt).toLocaleDateString(LOCALE, {
                    timeZone: TZ,
                    month: "short",
                  })}
                </span>
              </time>
              <div aria-hidden className="flex flex-col justify-center gap-1">
                <span className="text-xl leading-none font-medium uppercase">
                  {conversation.title}
                </span>
                {conversation.venue && (
                  <span className="text-sm font-light">
                    {conversation.venue}
                  </span>
                )}
                <span className="flex items-center text-sm leading-none font-light text-purple-300">
                  {conversation.startsAt && (
                    <time dateTime={conversation.startsAt ?? undefined}>
                      {formatTime(conversation.startsAt)}
                    </time>
                  )}
                  {conversation.startsAt && conversation.price && (
                    <>&nbsp;&middot;&nbsp;</>
                  )}
                  {conversation.price && <span>{conversation.price}</span>}
                </span>
              </div>
            </summary>
            <div className="flex flex-col gap-4 p-4">
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
                <p className="font-courier leading-tight font-light whitespace-pre-wrap">
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
