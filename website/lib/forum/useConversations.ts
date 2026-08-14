import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ComponentType, useCallback, useEffect } from "react";

import { MessageCircle, MicVocal, Newspaper } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";

import { usePusher } from "@/contexts/PusherProvider";

import useMe from "../auth/useMe";
import { CacheKey, Conversation, SimpleConversation } from "../types";

type FilterEnum = Lowercase<"TOPIC" | "EVENT" | "RELEASE" | "ALL">;

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

function sortByCreatedAtDesc(a: { createdAt: string }, b: { createdAt: string }) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortByPinnedFirst(filter: FilterEnum) {
  if (filter !== "all") return () => 0;

  return (a: SimpleConversation, b: SimpleConversation) => {
    if (a.isPinned && b.isPinned) return 0;

    return a.isPinned ? -1 : 1;
  };
}

function filterAndSort(
  conversations: Omit<Conversation, "messages">[],
  filter: FilterEnum
) {
  const byType =
    filter === "all"
      ? conversations
      : conversations.filter((c) => c.type === filter.toUpperCase());

  return byType
    .toSorted(sortByCreatedAtDesc)
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

  const counts = {
    all: conversations.length,
    topic: conversations.filter((c) => c.type === "TOPIC").length,
    event: 0,
    release: 0,
  };

  return {
    conversations: filterAndSort(conversations, activeFilter),
    counts,
    error,
    isLoading,
    activeFilter,
    updateActiveFilter: (filter: FilterEnum) => {
      setActiveFilter(filter);
    },
  };
}
