import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ComponentType, useCallback, useEffect } from "react";

import { MessageCircle, MicVocal, Newspaper } from "lucide-react";
import { parseAsStringEnum, parseAsTimestamp, useQueryState } from "nuqs";
import z from "zod";

import { usePusher } from "@/contexts/PusherProvider";

import useMe from "../auth/useMe";
import { getDateSpan, getMonthSpan, getWeekSpan } from "../date";
import { ConversationTypeEnum } from "../schemas";
import { CacheKey, Conversation, SimpleConversation } from "../types";

type FilterEnum = z.infer<typeof ConversationTypeEnum> | "all";

export const CONVERSATION_FILTERS: {
  type: ReturnType<typeof useConversations>["activeFilter"];
  label: string;
  icon: ComponentType<{ className?: string }> | null;
}[] = [
  { type: "all", label: "Tous", icon: null },
  {
    type: "topic",
    label: "Discussions",
    icon: MessageCircle,
  },
  {
    type: "event",
    label: "Evénements",
    icon: MicVocal,
  },
  {
    type: "release",
    label: "Sorties",
    icon: Newspaper,
  },
];

type TimeStampedItem = {
  createdAt: string;
  startsAt?: string | null;
};

function sortByCreatedAtDesc(a: TimeStampedItem, b: TimeStampedItem) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortByStartsAtAsc(a: TimeStampedItem, b: TimeStampedItem) {
  if (a.startsAt && b.startsAt)
    return (
      1 * (new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    );

  return a.startsAt ? -1 : 1;
}

function sortByTimeStamp(filter: FilterEnum) {
  return filter === "event" || filter === "release"
    ? sortByStartsAtAsc
    : sortByCreatedAtDesc;
}

function sortByPinnedFirst(filter: FilterEnum) {
  if (filter !== "all") return () => 0;

  return (a: SimpleConversation, b: SimpleConversation) => {
    if (a.isPinned && b.isPinned) return 0;

    return a.isPinned ? -1 : 1;
  };
}

function isActiveTimeframe(
  presetFrom: Date | null,
  presetTo: Date | null,
  from: Date | null,
  to: Date | null
) {
  return (
    presetFrom?.getTime() === from?.getTime() &&
    presetTo?.getTime() === to?.getTime()
  );
}

function filterByTimeframe(from: Date | null, to: Date | null) {
  return (c: Omit<Conversation, "messages">) => {
    if (!c.startsAt) return false;
    const startsAt = new Date(c.startsAt);
    if (from && startsAt < from) return false;
    if (to && startsAt > to) return false;
    return true;
  };
}

function filterAndSort(
  conversations: Omit<Conversation, "messages">[],
  filter: FilterEnum,
  from: Date | null,
  to: Date | null
) {
  const byType =
    filter === "all"
      ? conversations
      : conversations.filter((c) => c.type === filter.toUpperCase());

  const byTimeframe =
    filter === "event" || filter === "release"
      ? byType.filter(filterByTimeframe(from, to))
      : byType;

  return byTimeframe
    .toSorted(sortByTimeStamp(filter))
    .toSorted(sortByPinnedFirst(filter));
}

export default function useConversations(options?: { onLoaded?: () => void }) {
  const pusher = usePusher()?.pusher;
  const { me } = useMe();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useQueryState(
    "filter",
    parseAsStringEnum<FilterEnum>([
      "all",
      "event",
      "release",
      "topic",
    ]).withDefault("all")
  );
  const [from, setFrom] = useQueryState("from", parseAsTimestamp);
  const [to, setTo] = useQueryState("to", parseAsTimestamp);

  const timeframePresets = [
    { label: "Passés", from: null, to: getDateSpan().from, active: isActiveTimeframe(null, getDateSpan().from, from, to) },
    {
      label: "Cette semaine",
      from: getWeekSpan().monday,
      to: getWeekSpan().sunday,
      active: isActiveTimeframe(getWeekSpan().monday, getWeekSpan().sunday, from, to),
    },
    {
      label: "Ce mois ci",
      from: getMonthSpan().firstDay,
      to: getMonthSpan().lastDay,
      active: isActiveTimeframe(getMonthSpan().firstDay, getMonthSpan().lastDay, from, to),
    },
    {
      label: "Futurs",
      from: new Date(getMonthSpan().lastDay.getTime() + 1),
      to: null,
      active: isActiveTimeframe(new Date(getMonthSpan().lastDay.getTime() + 1), null, from, to),
    },
  ];

  const {
    data: conversations = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["conversations" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/conversations`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onLoaded?.();
      return response.json() as Promise<Omit<Conversation, "messages">[]>;
    },
  });

  const onReportedConversation = useCallback(
    (conversation: Omit<Conversation, "messages">) => {
      if (me?.role === "admin") return;
      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Omit<Conversation, "messages">[] = []) =>
          olds.filter(({ id }) => id !== conversation.id)
      );
      queryClient.removeQueries({
        queryKey: [`conversation-${conversation.id}` satisfies CacheKey],
      });
    },
    [me, queryClient]
  );

  useEffect(() => {
    if (!pusher) return;
    const conversationsChannel = pusher.subscribe(`conversations`);
    conversationsChannel.bind("conversation:report", onReportedConversation);
    return () => {
      pusher.unsubscribe(`conversations`);
    };
  }, [pusher, onReportedConversation]);

  return {
    conversations: filterAndSort(conversations, activeFilter, from, to),
    error,
    isLoading,
    activeFilter,
    updateActiveFilter: (filter: FilterEnum) => {
      setActiveFilter(filter);
    },
    timeframePresets,
    updateTimeFrame: (params: { from: Date | null; to: Date | null }) => {
      setFrom(params.from);
      setTo(params.to);
    },
  };
}
