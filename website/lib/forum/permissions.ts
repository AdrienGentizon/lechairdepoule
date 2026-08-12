import { Me } from "../auth/useMe";
import { Conversation, Message } from "../types";

export function isReportableConversation(
  conversation: Conversation,
  user?: Me
) {
  if (conversation.reportedAt) return false;
  if (conversation.createdBy.id === user?.id) return false;
  return true;
}

export function isReportableMessage(message: Message, user?: Me) {
  if (message.reportedAt) return false;
  if (message.user.id === user?.id) return false;
  return true;
}
