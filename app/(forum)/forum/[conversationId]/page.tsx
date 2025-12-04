"use client";

import ChatRoom from "@/components/ChatRoom/ChatRoom";
import { useParams } from "next/navigation";

export default function ChatRoomPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  return <ChatRoom conversationId={conversationId} />;
}
