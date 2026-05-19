import { ArrowLeft, Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { Me } from "@/lib/auth/useMe";
import { getEventTime } from "@/lib/date";
import { getConversationMetadataAsString } from "@/lib/forum/utils";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

import ConversationUrl from "../../ConversationsList/ConversationUrl";
import DeleteConversationButton from "./DeleteConversationButton/DeleteConversationButton";
import ReportConversationButton from "./ReportConversationButton/ReportConversationButton";
import UpdateConversationButton from "./UpdateConversationButton/UpdateConversationButton";

export default function ChatRoomHeader({
  me,
  conversation,
}: {
  me: Me;
  conversation: Conversation;
}) {
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
              "font-sans text-lg leading-none font-semibold uppercase",
              conversation.reportedAt && "text-neutral-400 line-through"
            )}
          >
            {conversation.title}
          </h1>
          <div className="flex flex-col gap-1 text-neutral-200">
            {conversation.venue && (
              <span className="inline-flex items-center gap-2 text-base font-light">
                <MapPin className="size-4" />
                {conversation.venue}
              </span>
            )}

            <span className="inline-flex items-center gap-2 text-sm leading-none font-light">
              {conversation.startsAt && <Clock className="size-4" />}
              <span>
                {conversation.startsAt && (
                  <time dateTime={conversation.startsAt ?? undefined}>
                    {getEventTime(conversation.startsAt)}
                  </time>
                )}
                {conversation.startsAt && conversation.price && <>&middot;</>}
                {conversation.price && <span>{conversation.price}</span>}
              </span>
            </span>
          </div>

          <ConversationUrl
            className="mt-2"
            conversation={conversation}
            hideIfInDescription
          />
        </div>
        <div className="ml-auto flex items-center gap-2 self-start pr-2">
          <UpdateConversationButton me={me} conversation={conversation} />
          <DeleteConversationButton me={me} conversation={conversation} />
          <ReportConversationButton me={me} conversation={conversation} />
        </div>
      </div>
      <div className="flex">
        <h3 className="ml-auto pr-2 font-mono text-xs">
          {getConversationMetadataAsString(conversation)}
        </h3>
      </div>
    </header>
  );
}
