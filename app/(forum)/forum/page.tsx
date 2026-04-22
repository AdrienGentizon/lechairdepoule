"use client";

import { useState } from "react";

import Button from "@/components/Button/Button";
import ConversationItem from "@/components/ConversationItem/ConversationItem";
import CreateTopicButton from "@/components/CreateTopicButton/CreateTopicButton";
import Loader from "@/components/Loader/Loader";
import useConversations from "@/lib/forum/useConversations";
import { cn } from "@/lib/utils";

type FilterType = "ALL" | "TOPIC" | "EVENT" | "RELEASE";

type Conversation = Omit<import("@/lib/types").Conversation, "messages">;

const FILTERS: { type: FilterType; label: string }[] = [
  { type: "ALL", label: "Tous" },
  { type: "TOPIC", label: "Discussions" },
  { type: "EVENT", label: "Evénements" },
  { type: "RELEASE", label: "Sorties" },
];

function filterAndSort(
  conversations: Conversation[],
  filter: FilterType
): Conversation[] {
  const result =
    filter === "ALL"
      ? conversations
      : conversations.filter((c) => c.type === filter);
  return [...result].sort((a, b) => {
    const dateA = new Date(a.startsAt ?? a.createdAt).getTime();
    const dateB = new Date(b.startsAt ?? b.createdAt).getTime();
    return dateB - dateA;
  });
}

export default function ForumPage() {
  const { conversations, isLoading } = useConversations();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const filtered = filterAndSort(conversations, activeFilter);

  return (
    <div className="grid grid-rows-[auto_1fr_auto]">
      <div className="flex items-center justify-center gap-2 pb-4">
        {FILTERS.map(({ type, label }) => {
          const count =
            type === "ALL"
              ? conversations.length
              : conversations.filter((c) => c.type === type).length;
          return (
            <Button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={cn(
                "px-1",
                activeFilter === type &&
                  "border-purple-300 bg-neutral-950 text-purple-300"
              )}
            >
              {label}{" "}
              {count > 0 && (
                <span
                  className={cn(
                    "desktop:flex hidden size-3 items-center justify-center rounded-full bg-white text-[8px] font-bold text-neutral-900",
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
      <ul className="grid auto-rows-min grid-cols-1 overflow-y-scroll">
        {filtered.map((conversation) => {
          return (
            <ConversationItem
              key={`forum-${conversation.id}`}
              conversation={conversation}
            />
          );
        })}
      </ul>
      <div className="flex flex-col border-t border-b border-white">
        <CreateTopicButton />
      </div>
      {isLoading && <Loader />}
    </div>
  );
}
