import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";

import TextParser from "@/components/TextParser";
import useMe, { Me } from "@/lib/auth/useMe";
import { formatTimestampAsString } from "@/lib/forum/utils";
import { Conversation, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

import { useChatRoom } from "../../ChatRoomContext";
import SubmitMessageForm from "../../SubmitMessageForm/SubmitMessageForm";
import ReportMessageButton from "./ReportMessageButton/ReportMessageButton";

function Header({ me, message }: { me?: Me; message: Message }) {
  return (
    <header className="flex items-center gap-2">
      <div className="flex w-full">
        <div className="flex items-center gap-2 rounded-t-sm bg-white px-2 text-black">
          <h3
            className={cn(
              "font-mono text-xs font-medium",
              message.user.bannedAt && "line-through"
            )}
          >
            {message.user.pseudo}{" "}
            <time
              dateTime={new Date(message.createdAt).toLocaleString()}
              className="pl-2 font-mono text-xs font-medium text-gray-500"
            >
              {formatTimestampAsString(message)}
            </time>
          </h3>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ReportMessageButton me={me} message={message} />
        </div>
      </div>
    </header>
  );
}

function ReplyInThreadButton({
  me,
  message,
  conversation,
  threadedMessages,
  showThread,
  updateShowThread,
}: {
  me?: Me;
  message: Message;
  conversation: Conversation;
  threadedMessages: (Message & { hasMention: boolean })[];
  showThread: boolean;
  updateShowThread: (show: boolean) => void;
}) {
  const ref = useRef<ComponentRef<"div">>(null);
  const { activeFormId, setActiveFormId } = useChatRoom();
  const formId = `thread-${message.id}`;
  const isFormActive = activeFormId === formId;

  useEffect(() => {
    if (showThread) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showThread]);

  if (!message.conversationId) return null;

  const toggleThread = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showThread) {
      updateShowThread(false);
      setActiveFormId(null);
    } else {
      updateShowThread(true);
      setActiveFormId(formId);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full scroll-mb-10 flex-col gap-2 pl-6 pt-2 sm:pl-12"
      )}
    >
      {showThread && me?.canPostMessage(conversation) && (
        <SubmitMessageForm
          me={me}
          conversation={conversation}
          formId={formId}
          messageId={message.id}
          buttonLabel={`Envoyer`}
          placeholder={`Participer dans le fil de discussion...`}
          onSuccess={() => {}}
        />
      )}

      {conversation.closedToContributionsAt === null && (
        <button
          type="button"
          className="ml-auto cursor-pointer text-xs underline hover:text-purple-300"
          onClick={toggleThread}
        >
          {showThread || isFormActive
            ? `Fermer le fil de discussion`
            : threadedMessages.length > 0
              ? `Rejoindre le fil de discussion (${threadedMessages.length})`
              : `Répondre dans le fil de discussion`}
        </button>
      )}
    </div>
  );
}

function Thread({
  message,
  conversation,
  threadedMessages,
  focusedMessageId,
}: {
  message: Message;
  conversation: Conversation;
  threadedMessages: (Message & { hasMention: boolean })[];
  focusedMessageId?: string;
}) {
  if (threadedMessages.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2 rounded-sm pl-6 pt-6 sm:pl-12">
      {threadedMessages.map((threadedMessage) => {
        return (
          <MessageItem
            key={`message-${message.id}-thread-${threadedMessage.id}`}
            message={threadedMessage}
            conversation={conversation}
            threadedMessages={[]}
            focusedMessageId={focusedMessageId}
          />
        );
      })}
    </ul>
  );
}

export default function MessageItem({
  message,
  conversation,
  threadedMessages,
  variant,
  focusedMessageId,
}: {
  message: Message;
  conversation: Conversation | undefined;
  threadedMessages: (Message & { hasMention: boolean })[];
  variant?: "admin";
  focusedMessageId?: string;
}) {
  const { me } = useMe();

  const [showThread, setShowThread] = useState(() =>
    threadedMessages.some((m) => m.id === focusedMessageId)
  );

  const scrollRef = useCallback(
    (node: ComponentRef<"li"> | null) => {
      if (!node || message.id !== focusedMessageId) return;
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [message.id, focusedMessageId]
  );

  return (
    <li ref={scrollRef} data-message-id={message.id} className="relative">
      <Header me={me} message={message} />
      <div className="rounded-b-sm border border-white p-2">
        <p
          className={cn(
            "font-courier whitespace-pre-wrap pl-2",
            (message.reportedAt !== null || message.user.bannedAt !== null) &&
              "text-neutral-400 line-through"
          )}
        >
          <TextParser text={message.body} />
        </p>
        {conversation && showThread && (
          <Thread
            conversation={conversation}
            message={message}
            threadedMessages={threadedMessages}
            focusedMessageId={focusedMessageId}
          />
        )}
        {conversation &&
          message.parentMessageId === null &&
          variant !== "admin" && (
            <ReplyInThreadButton
              me={me}
              message={message}
              conversation={conversation}
              threadedMessages={threadedMessages}
              showThread={showThread}
              updateShowThread={setShowThread}
            />
          )}
      </div>
    </li>
  );
}
