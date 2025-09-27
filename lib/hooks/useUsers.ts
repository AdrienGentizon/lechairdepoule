import { useQuery } from "@tanstack/react-query";
import { CacheKey, User } from "../types";

export default function useUsers() {
  const {
    data: users = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["users" satisfies CacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/users`);
      if (!response.ok) {
        console.log((await response.json()).error);
        return;
      }

      return response.json() as Promise<User[]>;
    },
  });

  return {
    users,
    error,
    isLoading,
  };
}
