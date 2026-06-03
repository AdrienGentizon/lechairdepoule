import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UserNotifications } from "../types";

export default function useUpdateUserNotifications() {
  const queryClient = useQueryClient();
  const { mutate: updateUserNotifications, isPending } = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const response = await fetch(`/api/me/notifications`, {
        method: "POST",
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<
        {
          id: string;
          userId: string;
          messageId: string;
          readAt: string | null;
        }[]
      >;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<UserNotifications>(
        ["me", "notifications"],
        (old = { mentions: [], replies: [] }) => {
          const readIds = new Set(
            updated.filter((n) => n.readAt !== null).map((n) => n.messageId)
          );
          return {
            mentions: old.mentions.filter((m) => !readIds.has(m.messageId)),
            replies: old.replies.filter((r) => !readIds.has(r.messageId)),
          };
        }
      );
    },
  });

  return { updateUserNotifications, isPending };
}
