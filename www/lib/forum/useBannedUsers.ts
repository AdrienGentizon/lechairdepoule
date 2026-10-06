import { useQuery } from "@tanstack/react-query";

import { BannedUser, CacheKey } from "../types";

export default function useBannedUsers() {
  const {
    data: bannedUsers = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["banned-users" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/users/banned`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<BannedUser[]>;
    },
  });

  return {
    bannedUsers,
    error,
    isLoading,
  };
}
