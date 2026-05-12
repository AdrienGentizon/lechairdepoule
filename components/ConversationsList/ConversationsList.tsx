import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import ConversationItem from "./ConversationItem";

export default function ConversationsList({
  conversations,
  className,
}: {
  conversations: Omit<Conversation, "messages">[];
  className?: string;
}) {
  return (
    <ul className={cn("grid auto-rows-min grid-cols-1", className)}>
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
