import { RefObject, useEffect } from "react";

import Image from "next/image";

import TextParser from "@/components/TextParser";
import useUserNotifications from "@/lib/forum/useUserNotifications";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <ul
      className={cn(
        "flex min-h-0 scroll-pb-16 flex-col gap-4 overflow-y-auto rounded-sm pt-6 pb-4 sm:gap-6",
        "mask-[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
      )}
    >
      {conversation.description && (
        <p
          className={cn(
            "font-courier rounded-sm border border-neutral-500 bg-neutral-800 p-2 font-light whitespace-pre-wrap",
            conversation.reportedAt && "text-neutral-400 line-through"
          )}
        >
          <TextParser text={conversation.description ?? ""} />
        </p>
      )}
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
