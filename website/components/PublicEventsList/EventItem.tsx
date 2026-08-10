import Image from "next/image";

import PeinePerdue from "@/components/png/PeinePerdue";
import { LOCALE, TZ, getEventTime } from "@/lib/date";
import { PublicConversation } from "@/lib/types";

import ConversationUrl from "../ConversationsList/ConversationUrl";
import TextParser from "../TextParser";
import ImportToCalendarButton from "./ImportToCalendarButton";

export default function EventItem({
  conversation,
  summary,
  startsAt,
  price,
  aria,
  variant,
}: {
  conversation: PublicConversation;
  summary: { title: string; description: string | null };
  startsAt: string;
  price: string | null;
  aria: {
    title: string;
  };
  variant?: "PP";
}) {
  return (
    <li className="border-foreground border-b py-2 first:border-t">
      <details name="events" className="relative cursor-pointer scroll-mt-6">
        <summary className="grid grid-cols-[5rem_1fr] gap-2 pr-4">
          <span className="sr-only">{aria.title}</span>
          <time
            aria-hidden
            dateTime={startsAt}
            className="flex h-full min-h-16 flex-col items-center justify-center uppercase leading-none"
          >
            <span className="text-xs font-light leading-none">
              {new Date(startsAt).toLocaleDateString(LOCALE, {
                timeZone: TZ,
                weekday: "short",
              })}
            </span>
            <span className="text-4xl font-black leading-none">
              {new Date(startsAt).toLocaleDateString(LOCALE, {
                timeZone: TZ,
                day: "2-digit",
              })}
            </span>
            <span className="text-sm font-black leading-none">
              {new Date(startsAt).toLocaleDateString(LOCALE, {
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
              {summary.title}
            </span>

            <div className="flex flex-col gap-0.5">
              {summary.description && (
                <span className="font-light leading-none">
                  {summary.description}
                </span>
              )}
              <span className="flex items-center leading-none text-purple-300">
                <time dateTime={startsAt ?? undefined}>
                  {getEventTime(startsAt)}
                </time>

                {price && <>&nbsp;&middot;&nbsp;</>}
                {price && <span className="leading-none">{price}</span>}
              </span>
            </div>
          </div>
          {variant === "PP" && (
            <div
              aria-hidden
              className="absolute right-0 top-1/2 z-10 origin-center -translate-y-1/2 rotate-12 scale-90"
            >
              <PeinePerdue className="size-16" />
            </div>
          )}
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
          <ConversationUrl conversation={conversation} hideIfInDescription />
        </div>
      </details>
    </li>
  );
}
