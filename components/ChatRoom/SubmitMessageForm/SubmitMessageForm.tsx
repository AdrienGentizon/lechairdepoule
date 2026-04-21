import { ReactNode, useState } from "react";

import { z } from "zod";

import Button from "@/components/Button/Button";
import Loader from "@/components/Loader/Loader";
import { Me } from "@/lib/auth/useMe";
import usePostConversationMessage from "@/lib/forum/usePostConversationMessage";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import { useChatRoom } from "../ChatRoomContext";
import MessageAugementedTextarea from "./MessageAugementedTextarea/MessageAugementedTextarea";

type Props = {
  me: Me;
  conversation: Conversation;
  formId: string;
  messageId?: string;
  autoFocus?: boolean;
  buttonLabel: ReactNode;
  placeholder?: string;
  withCloseButton?: boolean;
  onSuccess?: () => void;
};

export default function SubmitMessageForm({
  me,
  conversation,
  formId,
  messageId,
  autoFocus,
  buttonLabel,
  placeholder,
  withCloseButton = false,
  onSuccess,
}: Props) {
  const [body, setBody] = useState("");
  const { postConversationMessage, error, isPending } =
    usePostConversationMessage(conversation.id);
  const { activeFormId, setActiveFormId } = useChatRoom();

  const isActive = activeFormId === formId;

  return (
    <form
      className="flex w-full flex-col gap-1 px-0 sm:max-w-2xl"
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
              setActiveFormId(null);
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
          !isActive &&
            "border-foreground bg-background text-foreground min-h-auto border"
        )}
        rows={isActive ? undefined : 1}
        autoFocus={autoFocus ?? true}
        value={body}
        placeholder={placeholder}
        onFocus={() => setActiveFormId(formId)}
        onChange={(e) => {
          setBody(e.target.value);
        }}
        required
      />
      {error && <p className="text-red-500">{error.message}</p>}
      {isActive && (
        <div className="flex items-center justify-end gap-2">
          {withCloseButton && (
            <Button
              type="button"
              onClick={() => {
                setActiveFormId(null);
              }}
            >
              Annuler
            </Button>
          )}
          {me.canPostMessage(conversation) && (
            <Button type="submit" disabled={isPending}>
              {buttonLabel}
              {isPending && <Loader position="relative" />}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
