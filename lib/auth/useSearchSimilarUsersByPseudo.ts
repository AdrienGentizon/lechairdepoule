import { useQuery } from "@tanstack/react-query";

import { User } from "../types";

export default function useSearchSimilarUsersByPseudo(search: string) {
  const {
    data: similarUsers = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["users", "similar", search],
    queryFn: async () => {
      if (search.length === 0) return [];
      const response = await fetch(`/api/users?search=${search}`);
      if (!response.ok) {
        console.log((await response.json()).error);
        return;
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
