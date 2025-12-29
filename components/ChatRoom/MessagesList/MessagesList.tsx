import { RefObject, useEffect } from "react";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

import useUserMentions from "@/lib/forum/useUserMentions";
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
  const { userMentions } = useUserMentions();

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    if (!messageId) return;
    window.location.hash = messageId;
  }, [messageId]);

  return (
    <ul className="flex min-h-[calc(100dvh-400px)] flex-col gap-2 rounded-sm py-2">
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
              className="object-cover"
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
                  userMentions.find(
                    ({ messageId }) => messageId === message.id
                  ) !== undefined,
              };
            });
          const hasMention =
            userMentions.find(({ messageId }) => messageId === message.id) !==
            undefined;
          return (
            <MessageItem
              key={`main-conversation-message-${message.id}`}
              message={message}
              threadedMessages={threadedMessages}
              hasMention={hasMention}
            />
          );
        })}
      <li ref={lastEmptyLiRef} className="h-1 w-full bg-black p-0.5"></li>
    </ul>
  );
}
