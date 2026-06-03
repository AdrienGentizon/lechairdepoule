import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, User } from "../types";

export default function useBanUser() {
  const queryClient = useQueryClient();

  const {
    mutate: banUser,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/ban`, {
        method: "POST",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<User>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["users" satisfies CacheKey],
        (olds: User[] = []) => {
          return [...olds.filter(({ id }) => id !== data.id), data];
        }
      );
    },
  });

  return {
    banUser,
    error,
    isPending,
  };
}
