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
  const {
    conversations,
    counts,
    isLoading,
    activeFilter,
    timeframePresets,
    updateActiveFilter,
    updateTimeFrame,
  } = useConversations();

  return (
    <div className="grid grid-rows-[auto_1fr_auto]">
      <div className="relative">
        <div className="flex max-w-dvw items-center justify-center gap-2 overflow-x-scroll py-2">
          {CONVERSATION_FILTERS.map(({ type, label, icon: Icon }) => {
            const count = counts[type];
            return (
              <Button
                key={type}
                onClick={() => {
                  updateActiveFilter(type);
                  updateTimeFrame({ from: null, to: null });
                }}
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
        {["event", "release"].includes(activeFilter) && (
          <div className="flex items-center justify-center gap-2 py-2">
            {timeframePresets.map((filter, n) => {
              return (
                <Button
                  key={n}
                  className={cn(
                    "px-2",
                    filter.active &&
                      "border-purple-300 bg-neutral-950 text-purple-300"
                  )}
                  onClick={() => {
                    updateTimeFrame({ from: filter.from, to: filter.to });
                  }}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>
        )}
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
