import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UserMention } from "../types";

export default function useUpdateUserMentions() {
  const queryClient = useQueryClient();
  const { mutate: updateUserMentions, isPending } = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const response = await fetch(`/api/me/mentions`, {
        method: "POST",
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error ?? "erreur inconnue");
      }

      return response.json() as Promise<
        {
          id: string;
          userId: string;
          messageId: string;
          readAt: string | null;
        }[]
      >;
    },
    onSuccess: (maybeReadMentions) => {
      queryClient.setQueryData<UserMention[]>(
        ["me", "mentions"],
        (olds = []) => {
          return olds.reduce((acc: UserMention[], curr) => {
            const mutatedMention = maybeReadMentions.find(
              (mention) => mention.id === curr.id
            );
            console.log(mutatedMention);
            if (!mutatedMention || mutatedMention.readAt === null)
              return [...acc, curr];

            return acc;
          }, []);
        }
      );
    },
  });

  return { updateUserMentions, isPending };
}
