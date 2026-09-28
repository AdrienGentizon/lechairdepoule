import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import ConversationItem from "./ConversationItem";

export default function ConversationsList({
  conversations,
  className,
  isLoading,
}: {
  conversations: Omit<Conversation, "messages">[];
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <ul
      className={cn(
        "mask-fade-y relative grid auto-rows-min grid-cols-1",
        className
      )}
    >
      {!isLoading && conversations.length === 0 && (
        <li>
          <p className="font-courier rounded-sm border border-neutral-500 bg-neutral-800 px-4 py-1 text-center text-sm text-neutral-300">
            La liste est vide...
          </p>
        </li>
      )}
      {conversations.map((conversation) => {
        return (
          <ConversationItem
            key={`forum-${conversation.id}`}
            conversation={conversation}
          />
        );
      })}
    </ul>
  );
}
