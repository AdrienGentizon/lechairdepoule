import { useState } from "react";

import { z } from "zod";

import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";
import usePostConversationMessage from "@/lib/forum/usePostConversationMessage";

import MessageAugementedTextarea from "./MessageAugementedTextarea/MessageAugementedTextarea";

type Props = {
  conversationId: string;
  messageId?: string;
  onSuccess?: () => void;
};

export default function SubmitMessageForm({
  conversationId,
  messageId,
  onSuccess,
}: Props) {
  const [body, setBody] = useState("");
  const { postConversationMessage, error, isPending } =
    usePostConversationMessage(conversationId);

  return (
    <form
      className="flex flex-col gap-2 rounded-sm border border-white bg-black p-2 sm:max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (!e.currentTarget.checkValidity()) return;
        const parsedInputs = z.object({ body: z.string() }).safeParse({ body });

        if (!parsedInputs.success) {
          return console.error(parsedInputs.error.message);
        }

        postConversationMessage(
          { body: parsedInputs.data.body, parentMessageId: messageId ?? null },
          {
            onSuccess: () => {
              onSuccess?.();
              setBody("");
            },
          }
        );
      }}
    >
      <label htmlFor="body">Message</label>
      <MessageAugementedTextarea
        id="body"
        name="body"
        className="min-h-20 w-full rounded-sm px-4 py-2 font-courier text-black"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
        }}
        required
      />
      {error && <p className="text-red-500">{error.message}</p>}
      <Button className="ml-auto" type="submit" disabled={isPending}>
        Envoyer
        {isPending && <Loader position="relative" />}
      </Button>
    </form>
  );
}
