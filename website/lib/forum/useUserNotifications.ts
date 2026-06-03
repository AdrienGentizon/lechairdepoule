import { useQuery } from "@tanstack/react-query";

import { UserNotifications } from "../types";

export default function useUserNotifications() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["me", "notifications"],
    queryFn: async () => {
      const response = await fetch(`/api/me/notifications`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<UserNotifications>;
    },
  });

  return {
    mentions: data?.mentions ?? [],
    replies: data?.replies ?? [],
    unread: [...(data?.mentions ?? []), ...(data?.replies ?? [])].reduce(
      (acc, curr) => {
        if (curr.readAt !== null) return acc;
        return acc + 1;
      },
      0
    ),
    error,
    isLoading,
  };
}
