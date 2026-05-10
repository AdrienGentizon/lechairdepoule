"use client";

import { ReactNode, useState } from "react";

import { MessageCircle, MicVocal, Newspaper } from "lucide-react";
import z from "zod";

import Button from "@/components/Button/Button";
import ConversationItem from "@/components/ConversationItem/ConversationItem";
import CreateTopicButton from "@/components/CreateTopicButton/CreateTopicButton";
import Loader from "@/components/Loader/Loader";
import useConversations from "@/lib/forum/useConversations";
import { ConversationTypeEnum } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type FilterType = z.infer<typeof ConversationTypeEnum> | "ALL";

type Conversation = Omit<import("@/lib/types").Conversation, "messages">;

const FILTERS: { type: FilterType; label: string; icon: ReactNode }[] = [
  { type: "ALL", label: "Tous", icon: <></> },
  {
    type: "TOPIC",
    label: "Discussions",
    icon: <MessageCircle className="size-3" />,
  },
  {
    type: "EVENT",
    label: "Evénements",
    icon: <MicVocal className="size-3" />,
  },
  {
    type: "RELEASE",
    label: "Sorties",
    icon: <Newspaper className="size-3" />,
  },
];

function filterAndSort(
  conversations: Conversation[],
  filter: FilterType
): Conversation[] {
  const filtered =
    filter === "ALL"
      ? conversations
      : conversations.filter((c) => c.type === filter);
  return filtered
    .toSorted((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .toSorted((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
}

export default function ForumPage() {
  const { conversations, isLoading } = useConversations();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const filtered = filterAndSort(conversations, activeFilter);

  return (
    <div className="grid grid-rows-[auto_1fr_auto]">
      <div className="relative">
        <div className="flex max-w-dvw items-center justify-center gap-2 overflow-x-scroll pb-4">
          {FILTERS.map(({ type, label, icon }) => {
            const count =
              type === "ALL"
                ? conversations.length
                : conversations.filter((c) => c.type === type).length;
            return (
              <Button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={cn(
                  "px-2",
                  activeFilter === type &&
                    "border-purple-300 bg-neutral-950 text-purple-300"
                )}
              >
                {icon}
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
      <ul className="grid auto-rows-min grid-cols-1 overflow-y-scroll pt-8 pb-4">
        {filtered.map((conversation) => {
          return (
            <ConversationItem
              key={`forum-${conversation.id}`}
              conversation={conversation}
            />
          );
        })}
      </ul>
      <div className="relative flex flex-col border-t border-b border-white">
        <div className="from-background pointer-events-none absolute inset-x-0 -top-px h-8 -translate-y-full bg-linear-to-t to-transparent" />

        <CreateTopicButton />
      </div>
      {isLoading && <Loader />}
    </div>
  );
}
