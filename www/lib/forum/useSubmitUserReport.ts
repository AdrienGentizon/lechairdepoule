import { useMutation } from "@tanstack/react-query";

import { UserReport } from "../types";

export default function useSubmitUserReport() {
  const {
    mutate: submitUserReport,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (values: {
      type: UserReport["type"];
      body: string;
      pageUrl: string;
    }) => {
      const response = await fetch(`/api/me/user-reports`, {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      return response.json() as Promise<UserReport>;
    },
  });

  return {
    submitUserReport,
    error,
    isPending,
  };
}
