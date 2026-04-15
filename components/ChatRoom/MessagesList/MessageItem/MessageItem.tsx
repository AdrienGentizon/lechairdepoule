import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";

import Button from "@/components/Button/Button";
import useMe from "@/lib/auth/useMe";
import useUpdateUserMentions from "@/lib/forum/useUpdateUserMentions";
import { getMessageMetadataAsString } from "@/lib/forum/utils";
import { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";

import SubmitMessageForm from "../../SubmitMessageForm/SubmitMessageForm";
import BanUserButton from "./BanUserButton/BanUserButton";
import ReportMessageButton from "./ReportMessageButton/ReportMessageButton";

function Header({ me, message }: { me: User; message: Message }) {
  const canReportMessage = (message: Message) => {
    if (message.user.id === me?.id) return false;
    return true;
  };

  const canBanMessageUser = (message: Message) => {
    if (me?.role !== "admin") return false;
    if (message.user.id === me?.id) return false;
    if (message.user.bannedAt) return false;
    return true;
  };

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
          {canReportMessage(message) && (
            <ReportMessageButton message={message} />
          )}
          {canBanMessageUser(message) && <BanUserButton message={message} />}
        </div>
      </div>
    </header>
  );
}

function ReplyInThreadButton({ message }: { message: Message }) {
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
          conversationId={message.conversationId}
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
  threadedMessages,
}: {
  message: Message;
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
            threadedMessages={[]}
            hasMention={threadedMessage.hasMention}
          />
        );
      })}
    </ul>
  );
}

function MarkAsReadWhenInView({ messageId }: { messageId: string }) {
  const { updateUserMentions, isPending } = useUpdateUserMentions();
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
  threadedMessages,
  hasMention,
}: {
  message: Message;
  threadedMessages: (Message & { hasMention: boolean })[];
  hasMention: boolean;
}) {
  const { me } = useMe();

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
          {hasMention && <MarkAsReadWhenInView messageId={message.id} />}
          <Thread message={message} threadedMessages={threadedMessages} />
          {message.parentMessageId === null && (
            <ReplyInThreadButton message={message} />
          )}
        </div>
      </li>
    </>
  );
}
