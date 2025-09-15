import { Message } from "../types";

export function getMessageFromRaw(
  raw: {
    id: number;
    body: "Nanani";
    created_at: "2025-09-15T18:35:30.144";
    updated_at: null;
    reported_at: null;
    user_id: 2;
    conversation_id: null;
    reported_by: null;
  },
  user: {
    id: string;
    pseudo: string;
  },
) {
  return {
    id: raw.id.toString(),
    body: raw.body,
    conversationId: raw.conversation_id,
    createdAt: raw.created_at,
    reportedAt: raw.reported_at,
    updatedAt: raw.updated_at,
    user,
  } satisfies Message;
}
