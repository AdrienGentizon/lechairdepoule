import { getSinceAsString } from "../date";
import { Conversation, Message } from "../types";

export function getConversationMetadataAsString(
  conversation: Omit<Conversation, "messages">
) {
  const author = `créé par ${conversation.createdBy.pseudo}`;
  const since = `${getSinceAsString(new Date(conversation.createdAt))}`;
  return ["EVENT", "RELEASE"].includes(conversation.type ?? "")
    ? author
    : [author, since].join(" ");
}

export function getMessageMetadataAsString(message: Message) {
  return `${new Date(message.createdAt).toLocaleDateString()} ${new Date(message.createdAt).toLocaleTimeString()}`;
}
