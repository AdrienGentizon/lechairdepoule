import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CacheKey, Conversation, Message, User } from "../types";

export default function useUpdateUserPseudo(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const {
    mutate: updateUserPseudo,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (inputs: { pseudo: string }) => {
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

      queryClient.setQueryData(
        ["conversations" satisfies CacheKey],
        (olds: Conversation[] = []) => {
          return olds.reduce((acc: Conversation[], curr) => {
            return [
              ...acc,
              {
                ...curr,
                messages: curr.messages.reduce((acc: Message[], curr) => {
                  return acc.map((message) => {
                    if (message.user.id !== data.id) return message;
                    return {
                      ...message,
                      user: {
                        ...message.user,
                        pseudo: data.pseudo,
                      },
                    };
                  });
                }, []),
              },
            ];
          }, []);
        },
      );

      options?.onSuccess?.();
    },
  });

  return {
    updateUserPseudo,
    error,
    isPending,
  };
}
