import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CacheKey, Conversation, User } from "../types";

export default function useUpdateUserPseudo(options?: {
  onSuccess?: () => void;
}) {
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
      queryClient.setQueryData(["me" satisfies CacheKey], () => {
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
