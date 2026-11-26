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
    conversationId: raw.conversationId.toString(),
    parentMessageId: raw.parentMessageId?.toString() ?? null,
    createdAt: raw.createdAt,
    reportedAt: raw.reportedAt,
    updatedAt: raw.updatedAt,
    user,
  } satisfies Message;
}
