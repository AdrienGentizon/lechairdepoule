import { RefObject, useEffect } from "react";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import useUserNotifications from "@/lib/forum/useUserNotifications";
import { Conversation } from "@/lib/types";

import MessageItem from "./MessageItem/MessageItem";

type Props = {
  conversation: Conversation;
  lastEmptyLiRef: RefObject<HTMLLIElement | null>;
  scrollToBottom: () => void;
};

export default function MessagesList({
  conversation,
  lastEmptyLiRef,
  scrollToBottom,
}: Props) {
  const messageId = useSearchParams().get("messageId")?.toString();
  const { mentions } = useUserNotifications();

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    if (!messageId) return;
    window.location.hash = messageId;
  }, [messageId]);

  return (
    <ul className="desktop:gap-6 flex min-h-[calc(100dvh-400px)] flex-col gap-4 rounded-sm py-2">
      {conversation.coverUrl &&
        conversation.coverWidth &&
        conversation.coverHeight && (
          <li className="flex flex-col items-center justify-center">
            <Image
              src={conversation.coverUrl}
              width={conversation.coverWidth}
              height={conversation.coverHeight}
              alt=""
              aria-hidden
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100dvw, 600px"
            />
          </li>
        )}
      {conversation.messages
        .filter(({ parentMessageId }) => parentMessageId === null)
        .map((message) => {
          const threadedMessages = conversation.messages
            .filter(({ parentMessageId }) => parentMessageId === message.id)
            .map((message) => {
              return {
                ...message,
                hasMention:
                  mentions.find(({ messageId }) => messageId === message.id) !==
                  undefined,
              };
            });
          const hasMention =
            mentions.find(({ messageId }) => messageId === message.id) !==
            undefined;
          return (
            <MessageItem
              key={`main-conversation-message-${message.id}`}
              message={message}
              conversation={conversation}
              threadedMessages={threadedMessages}
              hasMention={hasMention}
            />
          );
        })}
      <li ref={lastEmptyLiRef} className="h-1 w-full bg-black p-0.5"></li>
    </ul>
  );
}
