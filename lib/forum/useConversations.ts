import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ComponentType, useCallback, useEffect, useState } from "react";

import { MessageCircle, MicVocal, Newspaper } from "lucide-react";
import z from "zod";

import { usePusher } from "@/contexts/PusherProvider";

import useMe from "../auth/useMe";
import { ConversationTypeEnum } from "../schemas";
import { CacheKey, Conversation } from "../types";

type FilterEnum = z.infer<typeof ConversationTypeEnum> | "ALL";

export const CONVERSATION_FILTERS: {
  type: ReturnType<typeof useConversations>["activeFilter"];
  label: string;
  icon: ComponentType<{ className?: string }> | null;
}[] = [
  { type: "ALL", label: "Tous", icon: null },
  {
    type: "TOPIC",
    label: "Discussions",
    icon: MessageCircle,
  },
  {
    type: "EVENT",
    label: "Evénements",
    icon: MicVocal,
  },
  {
    type: "RELEASE",
    label: "Sorties",
    icon: Newspaper,
  },
];

function filterAndSort(
  conversations: Omit<Conversation, "messages">[],
  filter: FilterEnum
) {
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

export default function useConversations(options?: { onLoaded?: () => void }) {
  const pusher = usePusher()?.pusher;
  const { me } = useMe();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterEnum>("ALL");

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
    conversations: filterAndSort(conversations, activeFilter),
    error,
    isLoading,
    activeFilter,
    updateActiveFilter: (filter: FilterEnum) => {
      setActiveFilter(filter);
    },
  };
}
