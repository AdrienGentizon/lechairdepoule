import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ConversationUrl({
  conversation,
  className,
  hideIfInDescription,
}: {
  conversation: Pick<Conversation, "id" | "url" | "description">;
  className?: string;
  hideIfInDescription?: boolean;
}) {
  if (!conversation.url) return null;
  if (
    hideIfInDescription &&
    conversation.description?.includes(conversation.url)
  )
    return null;

  return (
    <small
      className={cn(
        "font-courier rounded-sm border border-neutral-600 bg-neutral-800 p-2 text-sm",
        className
      )}
    >
      <span id={`url-label-${conversation.id}`}>En savoir plus</span>
      {": "}
      <a
        href={conversation.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-labelledby={`url-label-${conversation.id}`}
        className="text-purple-300 underline transition-colors hover:text-purple-400"
      >
        {conversation.url}
      </a>
    </small>
  );
}
