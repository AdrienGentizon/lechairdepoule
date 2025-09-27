import { useMutation } from "@tanstack/react-query";
import { Message } from "../types";

export default function useReportMessage() {
  const {
    mutate: reportMessage,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (
      messageId: string,
      options?: {
        onSuccess: () => void;
      },
    ) => {
      const response = await fetch(`/api/messages/${messageId}/report`, {
        method: "POST",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onSuccess();
      return response.json() as Promise<Message>;
    },
  });

  return {
    reportMessage,
    error,
    isPending,
  };
}
