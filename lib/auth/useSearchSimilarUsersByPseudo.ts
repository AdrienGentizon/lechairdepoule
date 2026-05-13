import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useEffect, useState } from "react";

import useDebounce from "../misc/useDebounce";
import { User } from "../types";

const fetchUsersByPseudo = async (search: string, exactMatch: boolean) => {
  if (search.length === 0) return [];
  const response = await fetch(
    `/api/users?search=${search}&exactMatch=${exactMatch ?? false}`
  );
  if (!response.ok) {
    console.log((await response.json()).error);
    return [];
  }

  return response.json() as Promise<(User & { similarity: number })[]>;
};

export default function useSearchSimilarUsersByPseudo(options?: {
  exactMatch?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [hasExactMatch, setHasExactMatch] = useState(false);
  const debouncedSearch = useDebounce(setSearch, 300);
  const queryClient = useQueryClient();

  const queryConfig = (search: string, exactMatch?: boolean) => {
    return {
      queryKey: ["users", exactMatch ? "exactMatch" : "similar", search],
      queryFn: () => fetchUsersByPseudo(search, exactMatch ?? false),
    };
  };

  const {
    data: similarUsers = [],
    error,
    isLoading,
  } = useQuery(queryConfig(search, options?.exactMatch));

  useEffect(() => {
    if (!options?.exactMatch) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasExactMatch(similarUsers.length > 0);
  }, [options, similarUsers]);

  const searchSimilarUsers = (search: string) =>
    queryClient.fetchQuery(queryConfig(search, options?.exactMatch));

  return {
    updateSearch: debouncedSearch,
    searchSimilarUsers,
    similarUsers,
    hasExactMatch,
    error,
    isLoading,
  };
}
