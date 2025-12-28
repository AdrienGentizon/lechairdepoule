import { useQuery } from "@tanstack/react-query";

import { User } from "../types";

export default function useSearchSimilarUsersByPseudo(
  search: string,
  options?: { exactMatch?: boolean }
) {
  const {
    data: similarUsers = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["users", options?.exactMatch ? "exactMatch" : "similar", search],
    queryFn: async () => {
      if (search.length === 0) return [];
      const response = await fetch(
        `/api/users?search=${search}&exactMatch=${options?.exactMatch ?? false}`
      );
      if (!response.ok) {
        console.log((await response.json()).error);
        return [];
      }

      return response.json() as Promise<(User & { similarity: number })[]>;
    },
  });

  return {
    similarUsers,
    error,
    isLoading,
  };
}
