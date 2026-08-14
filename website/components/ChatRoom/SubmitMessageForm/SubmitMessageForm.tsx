import { ReactNode, useState } from "react";

import { z } from "zod";

import Button from "@/components/Button/Button";
import { Me } from "@/lib/auth/useMe";
import usePostConversationMessage from "@/lib/forum/usePostConversationMessage";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import { useChatRoom } from "../ChatRoomContext";
import AugmentedTextarea from "./AugmentedTextarea/AugmentedTextarea";
import SubmitMessageButton from "./SubmitMessageButton";

type Props = {
  me?: Me;
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
  autoFocus: autoFocusFromProps,
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
  const autoFocus =
    autoFocusFromProps ?? me?.canPostMessage(conversation) ?? false;

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
      <AugmentedTextarea
        id="body"
        name="body"
        className={cn(
          "border-foreground bg-foreground font-courier min-h-20 w-full rounded-sm border px-4 py-2 text-black",
          !isActive &&
            "border-foreground bg-background text-foreground min-h-auto border"
        )}
        rows={isActive ? undefined : 1}
        autoFocus={autoFocus}
        value={body}
        placeholder={placeholder}
        options={{
          mentions: true,
        }}
        onFocus={() => setActiveFormId(formId)}
        onChange={(e) => {
          setBody(e.target.value);
        }}
        required
      />
      {error && <p className="text-red-500">{error.message}</p>}
      {isActive && (
        <div className="flex items-center justify-end gap-2 pb-2">
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
          <SubmitMessageButton
            me={me}
            buttonLabel={buttonLabel}
            isPending={isPending}
          />
        </div>
      )}
    </form>
  );
}
