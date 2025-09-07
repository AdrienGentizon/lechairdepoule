import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Message } from "../types";

export default function usePostMainConversationMessage() {
  const queryClient = useQueryClient();

  const {
    mutate: postMainConversationMessage,
    error,
    isPending,
  } = useMutation({
    mutationKey: ["main-conversation"],
    mutationFn: async (
      body: string,
      options?: {
        onSuccess: () => void;
      },
    ) => {
      const response = await fetch(`/api/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });

      if (!response.ok)
        throw new Error((await response.json())?.error ?? "erreur inconnue");

      options?.onSuccess();
      return response.json() as Promise<Message>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["main-conversation"],
        (existings: { messages: Message[] } = { messages: [] }) => {
          return { ...existings, messages: [...existings.messages, data] };
        },
      );
    },
  });

  return {
    postMainConversationMessage,
    error,
    isPending,
  };
}
