import { RefObject, useEffect } from "react";

import Image from "next/image";

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
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <ul className="flex min-h-[calc(100dvh-400px)] flex-col gap-2 rounded-sm py-2">
      {conversation.coverUrl &&
        conversation.coverWidth &&
        conversation.coverHeight && (
          <li>
            <Image
              src={conversation.coverUrl}
              width={conversation.coverWidth}
              height={conversation.coverHeight}
              alt=""
              aria-hidden
              className=""
            />
          </li>
        )}
      {conversation.messages
        .filter(({ parentMessageId }) => parentMessageId === null)
        .map((message) => {
          const threadedMessages = conversation.messages.filter(
            ({ parentMessageId }) => parentMessageId === message.id
          );
          return (
            <MessageItem
              key={`main-conversation-message-${message.id}`}
              message={message}
              threadedMessages={threadedMessages}
            />
          );
        })}
      <li ref={lastEmptyLiRef} className="h-1 w-full bg-black p-0.5"></li>
    </ul>
  );
}
