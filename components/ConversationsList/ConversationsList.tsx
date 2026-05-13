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
    <ul
      className={cn(
        "relative grid auto-rows-min grid-cols-1",
        "mask-[linear-gradient(to_bottom,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]",
        className
      )}
    >
      {conversations.length === 0 && (
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
