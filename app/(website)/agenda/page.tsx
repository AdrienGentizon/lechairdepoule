import { unstable_cache } from "next/cache";
import Image from "next/image";

import RefreshOnFocus from "@/components/RefreshOnFocus/RefreshOnFocus";
import selectConversationsByTypes from "@/lib/forum/selectConversationsByTypes";
import { getLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (hours === 0 && minutes === 0) return "minuit";
  return minutes === 0
    ? `${hours.toString().padStart(2, "0")}H`
    : `${hours.toString().padStart(2, "0")}H${minutes.toString().padStart(2, "0")}`;
}

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
  { tags: ["cachedAgenda"], revalidate: 43200 }
);

export default async function AgendaPage() {
  const conversations = await getCachedAgendaConversations();

  const sorted = [...conversations].sort((a, b) => {
    if (!a.startsAt) return 1;
    if (!b.startsAt) return -1;
    return a.startsAt.localeCompare(b.startsAt);
  });

  return (
    <div className="grid grid-cols-1 grid-rows-1 overflow-hidden">
      <h1 className="sr-only">Agenda hors les murs</h1>
      <ul
        className={cn(
          "flex min-h-0 scroll-pb-16 flex-col gap-4 overflow-y-auto rounded-sm pt-8 pb-4 sm:gap-6",
          "mask-[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
        )}
      >
        {sorted.map((conversation) => (
          <li
            key={conversation.id}
            className="border-foreground border-b py-3 first:border-t"
          >
            <details className="group cursor-pointer">
              <summary className="grid grid-cols-[100px_1fr] gap-2 pr-6">
                <time
                  dateTime={conversation.startsAt}
                  className="flex h-full min-h-16 flex-col items-center text-3xl leading-none font-black uppercase"
                >
                  <span>
                    {new Date(conversation.startsAt).toLocaleDateString(
                      "fr-FR",
                      { day: "2-digit" }
                    )}
                  </span>
                  <span>
                    {new Date(conversation.startsAt).toLocaleDateString(
                      "fr-FR",
                      { month: "short" }
                    )}
                  </span>
                </time>
                <div className="flex flex-col justify-center gap-1">
                  <span className="text-xl leading-none font-light uppercase">
                    {conversation.title}
                  </span>
                  {conversation.startsAt && (
                    <time
                      dateTime={conversation.startsAt ?? undefined}
                      className="text-sm font-light text-purple-300 uppercase"
                    >
                      {formatTime(conversation.startsAt)}
                    </time>
                  )}
                </div>
              </summary>
              <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                <div className="flex flex-col gap-4 overflow-hidden p-4">
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
                  <p className="font-courier leading-tight font-light whitespace-pre-wrap">
                    {conversation.description}
                  </p>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <RefreshOnFocus />
    </div>
  );
}
