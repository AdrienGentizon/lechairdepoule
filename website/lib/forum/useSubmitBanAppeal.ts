import { useMutation } from "@tanstack/react-query";

import { BanAppeal } from "../types";

export default function useSubmitBanAppeal() {
  const {
    mutate: submitBanAppeal,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (body: string) => {
      const response = await fetch(`/api/me/ban-appeal`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<BanAppeal>;
    },
  });

  return {
    submitBanAppeal,
    error,
    isPending,
  };
}
