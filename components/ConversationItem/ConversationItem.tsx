import { Skull } from "lucide-react";
import Link from "next/link";

import BanUserTrigger from "@/components/ChatRoom/MessagesList/MessageItem/BanUserTrigger/BanUserTrigger";
import { Me } from "@/lib/auth/useMe";
import { getConversationMetadataAsString } from "@/lib/forum/utils";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  conversation: Omit<Conversation, "messages">;
  variant?: "admin";
  me?: Me;
};

export default function ConversationItem({ conversation, variant, me }: Props) {
  return (
    <li
      className="relative flex h-min flex-col border-b border-white px-4 py-2 first:border-t"
      role="link"
      aria-labelledby={`forum-${conversation.id}`}
    >
      <Link href={`/forum/${conversation.id}`}>
        <h2
          id={`forum-${conversation.id}`}
          className={cn(
            "font-semibold uppercase",
            conversation.reportedAt && "text-neutral-400 line-through"
          )}
        >
          {conversation.title}
        </h2>
        <p
          className={cn(
            "font-light",
            conversation.reportedAt && "text-neutral-400 line-through"
          )}
        >
          {conversation.description}
        </p>
        <footer className="flex pt-2">
          <h3 className="ml-auto text-xs">
            {getConversationMetadataAsString(conversation)}
          </h3>
        </footer>
      </Link>
      {variant === "admin" && me && (
        <BanUserTrigger
          me={me}
          user={conversation.createdBy}
          className="absolute"
        >
          <button
            disabled={conversation.createdBy.bannedAt !== null}
            className="bg-background right-4 inline-flex cursor-pointer items-center gap-1 rounded-sm border border-white px-2 py-0.5 text-xs hover:bg-neutral-700 disabled:hidden"
          >
            <Skull className="size-3" />
            Bannir
          </button>
        </BanUserTrigger>
      )}
    </li>
  );
}
