import { useQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";

import useDebounce from "../misc/useDebounce";
import { User } from "../types";

export default function useSearchSimilarUsersByPseudo(options?: {
  exactMatch?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [hasExactMatch, setHasExactMatch] = useState(false);
  const debouncedSearch = useDebounce(setSearch, 300);

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

  useEffect(() => {
    if (!options?.exactMatch) return;
    setHasExactMatch(similarUsers.length > 0);
  }, [options, similarUsers]);

  return {
    updateSearch: debouncedSearch,
    similarUsers,
    hasExactMatch,
    error,
    isLoading,
  };
}
