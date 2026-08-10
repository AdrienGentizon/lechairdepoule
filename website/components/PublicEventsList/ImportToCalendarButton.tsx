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
      className="absolute right-4 top-4 -translate-y-1/2"
    >
      <CalendarIcon className="size-5" />
      <span className="sr-only">
        Ajouter {conversation.title} à mon calendrier
      </span>
    </a>
  );
}
