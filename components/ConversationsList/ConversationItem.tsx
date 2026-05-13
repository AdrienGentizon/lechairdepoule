import { Skull } from "lucide-react";
import Link from "next/link";

import BanUserTrigger from "@/components/ChatRoom/MessagesList/MessageItem/BanUserTrigger/BanUserTrigger";
import { Me } from "@/lib/auth/useMe";
import { getConversationMetadataAsString } from "@/lib/forum/utils";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import ConversationIcon from "./ConversationIcon";

type Props = {
  conversation: Omit<Conversation, "messages">;
  variant?: "admin";
  me?: Me;
};

export default function ConversationItem({ conversation, variant, me }: Props) {
  return (
    <li className="relative flex h-min flex-col border-b border-white px-4 py-2 first:border-t">
      <Link href={`/forum/${conversation.id}`} className="flex flex-col">
        <strong
          className={cn(
            "grid w-full grid-cols-[1fr_auto] grid-rows-1 items-start gap-2 pb-2 leading-none font-semibold uppercase",
            conversation.startsAt && "grid-cols-[1fr_auto_auto]",
            conversation.reportedAt && "text-neutral-400 line-through"
          )}
        >
          {conversation.title}
          {conversation.startsAt && (
            <em className="text-xs leading-4 font-light whitespace-nowrap text-purple-300 not-italic">{`${new Date(
              conversation.startsAt
            ).toLocaleDateString(undefined, {
              weekday: "short",
              month: "2-digit",
              day: "2-digit",
            })} à ${new Date(conversation.startsAt).toLocaleTimeString(
              undefined,
              {
                timeStyle: "short",
              }
            )}`}</em>
          )}
          <ConversationIcon type={conversation.type} className="size-4" />
        </strong>
        <p
          className={cn(
            "leading-tight font-light line-clamp-2",
            conversation.reportedAt && "text-neutral-400 line-through"
          )}
        >
          {conversation.description}
        </p>
        <small className="ml-auto w-fit pt-2 text-xs">
          {getConversationMetadataAsString(conversation)}
        </small>
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
