import { useId } from "react";

import { getEventMainUrl } from "@/lib/events";
import { cn } from "@/lib/utils";

export default function EventUrl({
  event,
  className,
}: {
  event: { url: string | null; description: string | null };
  className?: string;
}) {
  const labelId = useId();
  const url = getEventMainUrl(event);

  if (!url) return null;

  return (
    <small
      className={cn(
        "font-courier rounded-sm border border-neutral-600 bg-neutral-800 p-2 text-sm",
        className
      )}
    >
      <span id={labelId}>En savoir plus</span>
      {": "}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-labelledby={labelId}
        className="text-purple-300 underline transition-colors hover:text-purple-400"
      >
        {url}
      </a>
    </small>
  );
}
