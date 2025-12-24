import { useQuery } from "@tanstack/react-query";

import { CacheKey, User } from "../types";

export default function useMe() {
  const {
    data: me,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["me" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/me`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log((await response.json()).error);
        return;
      }

      return response.json() as Promise<User>;
    },
  });

  return {
    me,
    isLoading,
    error,
  };
}
