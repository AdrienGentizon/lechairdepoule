"use client";

import { useParams, useSearchParams } from "next/navigation";

import ChatRoom from "@/components/ChatRoom/ChatRoom";

export default function ChatRoomPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const messageId = useSearchParams().get("message")?.toString();

  return (
    <ChatRoom
      conversationId={conversationId}
      messageIdFromSearchParams={messageId}
    />
  );
}
