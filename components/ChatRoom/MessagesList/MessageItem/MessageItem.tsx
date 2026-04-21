import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";

import { z } from "zod";

import useMe, { Me } from "@/lib/auth/useMe";
import useUpdateUserNotifications from "@/lib/forum/useUpdateUserNotifications";
import { getMessageMetadataAsString } from "@/lib/forum/utils";
import { Conversation, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

import { useChatRoom } from "../../ChatRoomContext";
import SubmitMessageForm from "../../SubmitMessageForm/SubmitMessageForm";
import ReportMessageButton from "./ReportMessageButton/ReportMessageButton";

function Header({ me, message }: { me: Me; message: Message }) {
  return (
    <header className="flex items-center gap-2">
      <div className="flex w-full text-xs font-medium">
        <div className="flex items-center gap-2 rounded-t-sm bg-white px-2 text-black">
          <h3
            className={cn("text-sm", message.user.bannedAt && "line-through")}
          >
            {message.user.pseudo}{" "}
            <time
              dateTime={new Date(message.createdAt).toLocaleString()}
              className="pl-2 font-mono text-xs text-gray-500"
            >
              {getMessageMetadataAsString(message)}
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
  me: Me;
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
      className={cn("flex w-full scroll-mb-10 flex-col gap-2 pt-2 pl-12")}
    >
      {showThread && (
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
    </div>
  );
}

function Thread({
  message,
  conversation,
  threadedMessages,
}: {
  message: Message;
  conversation: Conversation;
  threadedMessages: (Message & { hasMention: boolean })[];
}) {
  if (threadedMessages.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2 rounded-sm pt-6 pl-12">
      {threadedMessages.map((threadedMessage) => {
        return (
          <MessageItem
            key={`message-${message.id}-thread-${threadedMessage.id}`}
            message={threadedMessage}
            conversation={conversation}
            threadedMessages={[]}
            hasMention={threadedMessage.hasMention}
          />
        );
      })}
    </ul>
  );
}

function MarkAsReadWhenInView({ messageId }: { messageId: string }) {
  const { updateUserNotifications: updateUserMentions, isPending } =
    useUpdateUserNotifications();
  const ref = useRef<ComponentRef<"div">>(null);

  const markAsRead = useCallback(() => {
    if (isPending) return;
    updateUserMentions([messageId]);
  }, [isPending, updateUserMentions, messageId]);

  useEffect(() => {
    if (!ref.current) return;
    const abortController = new AbortController();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markAsRead();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);

    return () => {
      abortController.abort();
    };
  }, [markAsRead]);
  return <div ref={ref} />;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function isSafeUrl(part: string): boolean {
  return z.string().url().startsWith("https://").safeParse(part).success;
}

function MessageBodyParser({ message }: { message: Message }) {
  const parts = message.body.split(URL_REGEX);

  return (
    <>
      {parts.map((part, n) => {
        if (part.match(URL_REGEX) && isSafeUrl(part)) {
          return (
            <a
              key={`message-${message.id}-link-${n}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}

export default function MessageItem({
  message,
  conversation,
  threadedMessages,
  hasMention,
  variant,
}: {
  message: Message;
  conversation: Conversation | undefined;
  threadedMessages: (Message & { hasMention: boolean })[];
  hasMention: boolean;
  variant?: "admin";
}) {
  const { me } = useMe();
  const [showThread, setShowThread] = useState(false);
  const enableAutoMarkAsRead = false;

  if (!me) return null;

  return (
    <>
      <li id={message.id} className="relative portrait:pb-6">
        <Header me={me} message={message} />
        <div className="rounded-b-sm border border-white p-2">
          <p
            className={cn(
              "font-courier pl-2",
              (message.reportedAt !== null || message.user.bannedAt !== null) &&
                "text-neutral-400 line-through"
            )}
          >
            <MessageBodyParser message={message} />
          </p>
          {enableAutoMarkAsRead && hasMention && (
            <MarkAsReadWhenInView messageId={message.id} />
          )}
          {conversation && showThread && (
            <Thread
              conversation={conversation}
              message={message}
              threadedMessages={threadedMessages}
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
    </>
  );
}
