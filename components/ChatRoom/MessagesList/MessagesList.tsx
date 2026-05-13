import { RefObject, useEffect } from "react";

import Image from "next/image";

import useUserNotifications from "@/lib/forum/useUserNotifications";
import { Conversation } from "@/lib/types";

import MessageItem from "./MessageItem/MessageItem";

type Props = {
  conversation: Conversation;
  lastEmptyLiRef: RefObject<HTMLLIElement | null>;
  messageIdFromSearchParams: string | undefined;
  scrollToBottom: () => void;
};

export default function MessagesList({
  conversation,
  lastEmptyLiRef,
  messageIdFromSearchParams,
  scrollToBottom,
}: Props) {
  const { mentions } = useUserNotifications();
  const focusedMessage = conversation?.messages.find(
    ({ id }) => id === messageIdFromSearchParams
  );

  useEffect(() => {
    if (!focusedMessage) scrollToBottom();
  }, [scrollToBottom, focusedMessage]);

  return (
    <ul className="flex min-h-0 scroll-pb-16 flex-col gap-4 overflow-y-auto rounded-sm pt-8 pb-4 sm:gap-6">
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

          return (
            <MessageItem
              key={message.id}
              message={message}
              conversation={conversation}
              threadedMessages={threadedMessages}
              focusedMessageId={messageIdFromSearchParams}
            />
          );
        })}
      <li ref={lastEmptyLiRef} className="h-1 w-full bg-black p-0.5"></li>
    </ul>
  );
}
