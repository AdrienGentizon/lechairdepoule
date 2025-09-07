import { useQuery } from "@tanstack/react-query";
import { Message } from "../types";

export default function useMainConversation(options?: {
  onLoaded: () => void;
}) {
  const {
    data: mainConversation = { messages: [] },
    error,
    isLoading,
  } = useQuery({
    queryKey: ["main-conversation"],
    queryFn: async () => {
      const response = await fetch(`/api/messages`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onLoaded();
      return response.json() as Promise<{ messages: Message[] }>;
    },
  });

  return {
    mainConversation,
    error,
    isLoading,
  };
}
