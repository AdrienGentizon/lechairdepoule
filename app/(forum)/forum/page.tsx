"use client";

import Button from "@/components/Button/Button";
import ConversationsList from "@/components/ConversationsList/ConversationsList";
import CreateTopicButton from "@/components/CreateTopicButton/CreateTopicButton";
import Loader from "@/components/Loader/Loader";
import useConversations, {
  CONVERSATION_FILTERS,
} from "@/lib/forum/useConversations";
import { cn } from "@/lib/utils";

export default function ForumPage() {
  const { conversations, isLoading, activeFilter, updateActiveFilter } =
    useConversations();

  return (
    <div className="grid grid-rows-[auto_1fr_auto]">
      <div className="relative">
        <div className="flex max-w-dvw items-center justify-center gap-2 overflow-x-scroll pb-4">
          {CONVERSATION_FILTERS.map(({ type, label, icon: Icon }) => {
            const count =
              type === "ALL"
                ? conversations.length
                : conversations.filter((c) => c.type === type).length;
            return (
              <Button
                key={type}
                onClick={() => updateActiveFilter(type)}
                className={cn(
                  "px-2",
                  activeFilter === type &&
                    "border-purple-300 bg-neutral-950 text-purple-300"
                )}
              >
                {Icon ? <Icon className="size-3" /> : <></>}
                {label}{" "}
                {count > 0 && (
                  <span
                    className={cn(
                      "flex size-3 items-center justify-center rounded-full bg-white text-[8px] font-bold text-neutral-900",
                      activeFilter === type && "bg-purple-300"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        <div className="from-background pointer-events-none absolute inset-x-0 z-10 h-8 bg-linear-to-b to-transparent" />
      </div>
      <ConversationsList
        conversations={conversations}
        className="overflow-y-scroll pt-8 pb-4"
      />

      <div className="relative flex flex-col border-t border-b border-white">
        <div className="from-background pointer-events-none absolute inset-x-0 -top-px h-8 -translate-y-full bg-linear-to-t to-transparent" />

        <CreateTopicButton />
      </div>
      {isLoading && <Loader />}
    </div>
  );
}
