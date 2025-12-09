"use client";

import { useParams } from "next/navigation";

import ChatRoom from "@/components/ChatRoom/ChatRoom";

export default function ChatRoomPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  return <ChatRoom conversationId={conversationId} />;
}
