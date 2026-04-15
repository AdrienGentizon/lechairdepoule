import { getSinceAsString } from "../date";
import { Conversation, Message } from "../types";

export function getConversationMetadataAsString(
  conversation: Omit<Conversation, "messages">
) {
  return `créé par ${conversation.createdBy.pseudo} ${getSinceAsString(new Date(conversation.createdAt))}`;
}

export function getMessageMetadataAsString(message: Message) {
  return `${new Date(message.createdAt).toLocaleDateString()} ${new Date(message.createdAt).toLocaleTimeString()}`;
}
