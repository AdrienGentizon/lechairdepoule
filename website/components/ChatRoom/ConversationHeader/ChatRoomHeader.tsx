import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Me } from "@/lib/auth/useMe";
import { getConversationMetadata } from "@/lib/forum/utils";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import DeleteConversationButton from "./DeleteConversationButton/DeleteConversationButton";
import ReportConversationButton from "./ReportConversationButton/ReportConversationButton";
import UpdateConversationButton from "./UpdateConversationButton/UpdateConversationButton";

export default function ChatRoomHeader({
  me,
  conversation,
}: {
  me?: Me;
  conversation: Conversation;
}) {
  const { pseudo, since } = getConversationMetadata(conversation);

  return (
    <header className="bg-background text-foreground flex flex-col py-2">
      <div className="flex items-center gap-4">
        <nav className="self-start">
          <Link href={`/forum`}>
            <ArrowLeft />
          </Link>
        </nav>
        <div className="font-courier flex flex-col gap-2">
          <h1
            className={cn(
              "font-sans text-lg font-semibold uppercase leading-none",
              conversation.reportedAt && "text-neutral-400 line-through"
            )}
          >
            {conversation.title}
          </h1>
          <div className="flex flex-col gap-1 text-neutral-200">
            <span className="inline-flex items-center gap-2 text-sm font-light leading-none"></span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 self-start pr-2">
          <UpdateConversationButton me={me} conversation={conversation} />
          <DeleteConversationButton me={me} conversation={conversation} />
          <ReportConversationButton me={me} conversation={conversation} />
        </div>
      </div>
      <div className="flex pt-1">
        <h3 className="ml-auto pr-2 text-xs">
          <span className="sr-only">créé par </span>
          <span className="font-semibold">{pseudo}</span>, {since}
        </h3>
      </div>
    </header>
  );
}
