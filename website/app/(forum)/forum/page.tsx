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
  const disableFilter = true;

  const { conversations, counts, isLoading, activeFilter, updateActiveFilter } =
    useConversations();

  return (
    <div className="grid grid-rows-[auto_1fr_auto]">
      <h1 className="sr-only">Forum</h1>
      <div className="max-h-dvw flex w-full flex-col overflow-hidden pl-2">
        <div className="flex items-center gap-2 overflow-x-scroll py-2 sm:justify-center">
          {!disableFilter &&
            CONVERSATION_FILTERS.map(({ type, label, icon: Icon }) => {
              const count = counts[type];
              return (
                <Button
                  key={type}
                  onClick={() => {
                    updateActiveFilter(type);
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
      </div>
      <ConversationsList
        conversations={conversations}
        className="overflow-y-scroll pb-4 pt-4"
        isLoading={isLoading}
      />

      <div className="flex flex-col border-b border-t border-white">
        <CreateTopicButton />
      </div>
      {isLoading && <Loader />}
    </div>
  );
}
