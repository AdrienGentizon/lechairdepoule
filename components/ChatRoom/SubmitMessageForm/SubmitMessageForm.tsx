import { FormEvent } from "react";

import { Loader } from "lucide-react";
import { z } from "zod";

import usePostConversationMessage from "@/lib/forum/usePostConversationMessage";

type Props = {
  conversationId: string;
  onSuccess: (e: FormEvent<HTMLFormElement>) => void;
};

export default function SubmitMessageForm({
  conversationId,
  onSuccess,
}: Props) {
  const { postConversationMessage, error, isPending } =
    usePostConversationMessage(conversationId);

  return (
    <form
      className="flex flex-col gap-2 rounded-sm border border-white bg-black p-2 sm:max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (!e.currentTarget.checkValidity()) return;
        const parsedInputs = z
          .object({ body: z.string() })
          .safeParse(
            Object.fromEntries(new FormData(e.currentTarget).entries())
          );

        if (!parsedInputs.success) {
          return console.error(parsedInputs.error.message);
        }

        postConversationMessage(
          { body: parsedInputs.data.body, parentMessageId: null },
          {
            onSuccess: () => onSuccess(e),
          }
        );
      }}
    >
      <label htmlFor="body">Message</label>
      <textarea
        id="body"
        name="body"
        className="min-h-20 rounded-sm px-4 py-2 font-courier text-black"
        required
      ></textarea>
      {error && <p className="text-red-500">{error.message}</p>}
      <button
        className="flex items-center justify-center rounded-sm border border-white px-8 py-0.5 font-semibold hover:bg-white/25 disabled:opacity-50"
        type="submit"
        disabled={isPending}
      >
        Envoyer
        {isPending && (
          <div className="fixed left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2">
            <Loader className="animate-spin" />
          </div>
        )}
      </button>
    </form>
  );
}
