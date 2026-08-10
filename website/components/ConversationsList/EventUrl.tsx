import { useId } from "react";

import { cn } from "@/lib/utils";

export default function EventUrl({
  url,
  className,
}: {
  url: string | null;
  className?: string;
}) {
  const labelId = useId();

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
