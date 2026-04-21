import { ReactNode, useState } from "react";

import { z } from "zod";

import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";
import { Me } from "@/lib/auth/useMe";
import usePostConversationMessage from "@/lib/forum/usePostConversationMessage";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import MessageAugementedTextarea from "./MessageAugementedTextarea/MessageAugementedTextarea";

type Props = {
  me: Me;
  conversation: Conversation;
  messageId?: string;
  variant?: "dark";
  autoFocus?: boolean;
  buttonLabel: ReactNode;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function SubmitMessageForm({
  me,
  conversation,
  messageId,
  variant,
  autoFocus,
  buttonLabel,
  onSuccess,
  onCancel,
}: Props) {
  const [body, setBody] = useState("");
  const { postConversationMessage, error, isPending } =
    usePostConversationMessage(conversation.id);

  return (
    <form
      className="flex w-full flex-col gap-1 sm:max-w-2xl"
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
      <label htmlFor="body" className="sr-only">
        Message
      </label>
      <MessageAugementedTextarea
        id="body"
        name="body"
        className={cn(
          "border-foreground bg-foreground font-courier min-h-20 w-full rounded-sm border px-4 py-2 text-black",
          variant === "dark" &&
            "border-foreground bg-background text-foreground border"
        )}
        autoFocus={autoFocus}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
        }}
        required
      />
      {error && <p className="text-red-500">{error.message}</p>}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {me.canPostMessage(conversation) && (
          <Button type="submit" disabled={isPending}>
            {buttonLabel}
            {isPending && <Loader position="relative" />}
          </Button>
        )}
      </div>
    </form>
  );
}
