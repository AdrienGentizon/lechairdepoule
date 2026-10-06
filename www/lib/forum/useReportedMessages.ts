import { useQuery } from "@tanstack/react-query";

import { CacheKey, Message } from "../types";

export default function useReportedMessages() {
  const {
    data: reportedMessages = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["reported-messages" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/messages/reported`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<Message[]>;
    },
  });

  return {
    reportedMessages: reportedMessages.toSorted((a, b) => {
      return (
        new Date(b.reportedAt ?? "").getTime() -
        new Date(a.reportedAt ?? "").getTime()
      );
    }),
    error,
    isLoading,
  };
}
