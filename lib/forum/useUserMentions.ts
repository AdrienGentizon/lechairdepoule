import { useQuery } from "@tanstack/react-query";

import { UserMention } from "../types";

export default function useUserMentions() {
  const {
    data: userMentions = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["me", "mentions"],
    queryFn: async () => {
      const response = await fetch(`/api/me/mentions`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<UserMention[]>;
    },
  });
  return { userMentions, error, isLoading };
}
