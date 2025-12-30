import { ComponentRef, useCallback, useEffect, useRef, useState } from "react";

import useMe from "@/lib/auth/useMe";
import useUpdateUserMentions from "@/lib/forum/useUpdateUserMentions";
import { Message, isMessageWithConversationId } from "@/lib/types";
import { cn } from "@/lib/utils";

import SubmitMessageForm from "../../SubmitMessageForm/SubmitMessageForm";
import BanUserButton from "./BanUserButton/BanUserButton";
import CreateThreadButton from "./CreateThreadButton/CreateThreadButton";
import ReportMessageButton from "./ReportMessageButton/ReportMessageButton";

function MarkAsReadWhenInView({ messageId }: { messageId: string }) {
  const { updateUserMentions, isPending } = useUpdateUserMentions();
  const ref = useRef<ComponentRef<"div">>(null);

  const markAsRead = useCallback(() => {
    if (isPending) return;
    updateUserMentions([messageId]);
  }, [messageId, isPending]);

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
  }, []);
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

  const [showThread, setShowThread] = useState(false);

  const canReportMessage = (message: Message) => {
    if (message.user.id === me?.id) return false;
    return true;
  };

  const canBanMessageUser = (message: Message) => {
    if (me?.role !== "admin") return false;
    if (message.user.id === me?.id) return false;
    return true;
  };

  return (
    <>
      <li id={message.id} className="group relative portrait:pb-6">
        <div className="flex items-center gap-2">
          <div className="flex w-full text-xs font-medium">
            <div className="flex items-center gap-2 rounded-t-sm bg-white px-2 text-black">
              <h3
                className={cn(
                  "text-sm",
                  message.user.bannedAt && "line-through"
                )}
              >
                {message.user.pseudo}
              </h3>
            </div>
            <div className="ml-auto flex items-center gap-1 group-hover:flex landscape:hidden">
              {canReportMessage(message) && (
                <ReportMessageButton message={message} />
              )}
              {canBanMessageUser(message) && (
                <BanUserButton message={message} />
              )}
            </div>
          </div>
        </div>
        <div className="rounded-b-sm border border-white">
          <p
            className={cn(
              "px-4 py-2 font-courier",
              (message.reportedAt !== null || message.user.bannedAt !== null) &&
                "text-neutral-400 line-through"
            )}
          >
            <MessageBodyParser message={message} />
          </p>
          <footer className="flex items-center justify-end gap-2 px-2 pb-2 font-mono text-[0.6rem] font-light">
            {threadedMessages.length > 0 && (
              <p className="cursor-pointer underline">
                <button
                  onClick={() => {
                    setShowThread((prev) => !prev);
                  }}
                >
                  {showThread ? "cacher" : "voir"} {threadedMessages.length}{" "}
                  réponse(s)
                </button>
              </p>
            )}
            <time dateTime={new Date(message.createdAt).toLocaleString()}>
              {new Date(message.createdAt).toLocaleDateString()}{" "}
              {new Date(message.createdAt).toLocaleTimeString()}
            </time>
          </footer>
          {hasMention && <MarkAsReadWhenInView messageId={message.id} />}
        </div>
        {!showThread &&
          isMessageWithConversationId(message) &&
          message.parentMessageId === null && (
            <CreateThreadButton
              onClick={() => {
                setShowThread(true);
              }}
            />
          )}
      </li>
      {showThread && (
        <li className="ml-auto w-full max-w-[calc(100%-4rem)] pb-4">
          <ul className="flex flex-col gap-2 rounded-sm border border-white p-2">
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
            <li>
              {message.conversationId && (
                <SubmitMessageForm
                  conversationId={message.conversationId}
                  messageId={message.id}
                />
              )}
            </li>
          </ul>
        </li>
      )}
    </>
  );
}
