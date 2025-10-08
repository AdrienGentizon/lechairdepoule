import { Conversation, Message, User } from "@/lib/types";
import ReportMessageButton from "../ReportMessageButton/ReportMessageButton";
import BanUserButton from "../BanUserButton/BanUserButton";
import { useRef, ComponentRef, useEffect, RefObject } from "react";
import { cn } from "@/lib/utils";

type Props = {
  me: User;
  conversation: Conversation;
  lastEmptyLiRef: RefObject<HTMLLIElement | null>;
  scrollToBottom: () => void;
};

export default function MessagesList({
  me,
  conversation,
  lastEmptyLiRef,
  scrollToBottom,
}: Props) {
  const canReportMessage = (message: Message) => {
    if (message.user.id === me?.id) return false;
    return true;
  };

  const canBanMessageUser = (message: Message) => {
    if (me.role !== "admin") return false;
    if (message.user.id === me.id) return false;
    return true;
  };

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <ul className="flex min-h-[calc(100dvh-400px)] flex-col gap-2 rounded-sm py-2">
      {conversation.messages.map((message) => {
        return (
          <li key={`main-conversation-message-${message.id}`} className="group">
            <div className="flex items-center gap-2">
              <div className="flex w-full text-xs font-medium">
                <div className="flex items-center gap-2 rounded-t-sm bg-white px-2 text-black">
                  <h3
                    className={cn(
                      "text-sm",
                      message.user.bannedAt && "line-through",
                    )}
                  >
                    {message.user.pseudo}
                  </h3>
                </div>
                <div className="ml-auto flex items-center gap-1 group-hover:flex landscape:hidden">
                  {canReportMessage(message) && (
                    <ReportMessageButton message={message} />
                  )}
                  {canBanMessageUser(message) && (
                    <BanUserButton message={message} />
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-b-sm border border-white">
              <p
                className={cn(
                  "px-4 py-2 font-courier",
                  (message.reportedAt !== null ||
                    message.user.bannedAt !== null) &&
                    "text-neutral-400 line-through",
                )}
              >
                {message.body}
              </p>
              <footer className="flex items-center justify-end gap-2 px-2 pb-2 font-mono text-[0.6rem] font-light">
                <p>
                  {new Date(message.createdAt).toLocaleDateString()}{" "}
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </footer>
            </div>
          </li>
        );
      })}
      <li ref={lastEmptyLiRef} className="h-1 w-full bg-black p-0.5"></li>
    </ul>
  );
}
function scrollToBottom() {
  throw new Error("Function not implemented.");
}
