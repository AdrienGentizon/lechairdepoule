import { useMutation } from "@tanstack/react-query";

import { UserReport } from "@cdp/lib/types";
import { UserReportInput } from "@cdp/lib/validation";

export default function useSubmitUserReport() {
  const {
    mutate: submitUserReport,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (inputs: UserReportInput) => {
      const response = await fetch(`/api/me/user-reports`, {
        method: "POST",
        body: JSON.stringify(inputs),
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
