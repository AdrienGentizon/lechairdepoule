import { Message, RawMessage } from "../types";

export function getMessageFromRaw(
  raw: RawMessage,
  user: {
    id: string;
    pseudo: string;
    bannedAt: string | null;
  },
) {
  return {
    id: raw.id.toString(),
    body: raw.body,
    conversationId: raw.conversation_id.toString(),
    createdAt: raw.created_at,
    reportedAt: raw.reported_at,
    updatedAt: raw.updated_at,
    user,
  } satisfies Message;
}
