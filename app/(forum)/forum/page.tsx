"use client";

import Link from "next/link";

import CreateTopicButton from "@/components/CreateTopicButton/CreateTopicButton";
import Loader from "@/components/Loader/Loader";
import useConversations from "@/lib/forum/useConversations";
import { getConversationMetadataAsString } from "@/lib/forum/utils";
import { Conversation } from "@/lib/types";

function TopicItem({
  conversation,
}: {
  conversation: Omit<Conversation, "messages">;
}) {
  return (
    <li
      className="relative flex h-min flex-col border-b border-white px-4 py-2 first:border-t"
      role="link"
      aria-labelledby={`forum-${conversation.id}`}
    >
      <Link href={`/forum/${conversation.id}`}>
        <h2 id={`forum-${conversation.id}`} className="font-semibold uppercase">
          {conversation.title}
        </h2>
        <p className="font-light">{conversation.description}</p>
        <footer className="flex pt-2">
          <h3 className="ml-auto text-xs">
            {getConversationMetadataAsString(conversation)}
          </h3>
        </footer>
      </Link>
    </li>
  );
}

export default function ForumPage() {
  const { conversations, isLoading } = useConversations();

  return (
    <>
      <ul className="grid auto-rows-min grid-cols-1 overflow-y-scroll">
        {conversations.map((conversation) => {
          return (
            <TopicItem
              key={`forum-${conversation.id}`}
              conversation={conversation}
            />
          );
        })}
      </ul>
      <div className="flex flex-col border-t border-b border-white">
        <CreateTopicButton />
      </div>
      {isLoading && <Loader />}
    </>
  );
}
