"use client";

import ConversationItem from "@/components/ConversationItem/ConversationItem";
import CreateTopicButton from "@/components/CreateTopicButton/CreateTopicButton";
import Loader from "@/components/Loader/Loader";
import useConversations from "@/lib/forum/useConversations";

export default function ForumPage() {
  const { conversations, isLoading } = useConversations();

  return (
    <>
      <ul className="grid auto-rows-min grid-cols-1 overflow-y-scroll">
        {conversations.map((conversation) => {
          return (
            <ConversationItem
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
