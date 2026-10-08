import { useQuery } from "@tanstack/react-query";

import { CacheKey, Conversation, User } from "../types";

type SimpleConversation = Omit<Conversation, "messages">;

function getPermissions(user: User) {
  return {
    canBanUser(targetUser: { id: string; bannedAt: string | null }) {
      if (targetUser.bannedAt) return false;
      if (user.bannedAt) return false;
      if (user.role !== "admin") return false;
      if (user.id === targetUser.id) return false;
      return true;
    },
    canPostMessage(conversation: SimpleConversation) {
      if (conversation.reportedAt) return false;
      return true;
    },
    canUpdateConversation(conversation: SimpleConversation) {
      if (user.bannedAt) return false;
      if (conversation.reportedAt) return false;
      if (conversation.createdBy.id !== user.id) return false;
      return true;
    },
    canDeleteConversation(conversation: SimpleConversation) {
      if (user.bannedAt) return false;
      if (conversation.reportedAt) return false;
      if (conversation.createdBy.id !== user.id) return false;
      return true;
    },
  };
}

export default function useMe() {
  const {
    data: me,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["me" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/me`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log((await response.json()).error);
        return null;
      }

      return response.json() as Promise<User>;
    },
  });

  return {
    me: me
      ? {
          ...me,
          ...getPermissions(me),
        }
      : undefined,
    isFetching,
    error,
  };
}

export type Me = NonNullable<ReturnType<typeof useMe>["me"]>;
