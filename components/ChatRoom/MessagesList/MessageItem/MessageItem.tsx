import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";

import { Skull } from "lucide-react";

import Button from "@/components/Button/Button";
import useMe, { Me } from "@/lib/auth/useMe";
import useUpdateUserNotifications from "@/lib/forum/useUpdateUserNotifications";
import { getMessageMetadataAsString } from "@/lib/forum/utils";
import { Conversation, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

import SubmitMessageForm from "../../SubmitMessageForm/SubmitMessageForm";
import BanUserTrigger from "./BanUserTrigger/BanUserTrigger";
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
          <BanUserTrigger me={me} user={message.user}>
            <button
              disabled={message.user.bannedAt !== null}
              className="inline-flex h-full items-center gap-1 rounded-t-sm border-t border-r border-l border-white px-2 hover:bg-neutral-600 disabled:hidden"
            >
              <Skull className="size-3" />
              Bannir
            </button>
          </BanUserTrigger>
        </div>
      </div>
    </header>
  );
}

function ReplyInThreadButton({
  me,
  message,
  conversation,
}: {
  me: Me;
  message: Message;
  conversation: Conversation;
}) {
  const [showTextarea, setShowTextarea] = useState(false);
  const ref = useRef<ComponentRef<"div">>(null);

  useEffect(() => {
    if (showTextarea) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showTextarea]);

  if (!message.conversationId) return null;
  return (
    <div ref={ref} className={cn("scroll-mb-10 pt-2", showTextarea && "pl-12")}>
      {!showTextarea && (
        <Button
          type="button"
          className="ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            setShowTextarea(true);
          }}
        >
          Répondre
        </Button>
      )}
      {showTextarea && (
        <SubmitMessageForm
          me={me}
          conversation={conversation}
          messageId={message.id}
          variant="dark"
          autoFocus
          buttonLabel={`Répondre`}
          onSuccess={() => {
            setShowTextarea(false);
          }}
        />
      )}
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

function MessageBodyParser({ message }: { message: Message }) {
  const parts = message.body.split(URL_REGEX);

  return (
    <>
      {parts.map((part, n) => {
        if (part.match(URL_REGEX)) {
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
          {conversation && (
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
              />
            )}
        </div>
      </li>
    </>
  );
}
