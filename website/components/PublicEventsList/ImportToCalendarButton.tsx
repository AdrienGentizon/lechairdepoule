"use client";

import { CalendarIcon } from "lucide-react";

import { PublicConversation } from "@/lib/types";

export default function ImportToCalendarButton({
  conversation,
}: {
  conversation: PublicConversation;
}) {
  return (
    <a
      href={`/api/conversations/${conversation.id}/calendar`}
      className="absolute right-4 top-4 hidden -translate-y-1/2 group-open:block"
      onClick={(e) => e.stopPropagation()}
    >
      <CalendarIcon className="size-5" />
      <span className="sr-only">Ajouter à mon calendrier</span>
    </a>
  );
}
