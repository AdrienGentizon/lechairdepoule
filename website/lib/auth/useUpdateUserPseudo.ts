import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, User } from "../types";

export default function useUpdateUserPseudo(options?: {
  onSuccess?: () => void;
}) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const {
    mutate: updateUserPseudo,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (inputs: { pseudo: string; cgu: boolean }) => {
      const response = await fetch(`/api/me`, {
        method: "PATCH",
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<User>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me" satisfies CacheKey, userId], () => {
        return data;
      });

      options?.onSuccess?.();
    },
  });

  return {
    updateUserPseudo,
    error,
    isPending,
  };
}
