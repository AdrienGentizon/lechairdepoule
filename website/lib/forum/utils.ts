import { getSinceAsString } from "../date";
import { Conversation } from "../types";

export function getConversationMetadata(
  conversation: Omit<Conversation, "messages">
) {
  return {
    pseudo: conversation.createdBy.pseudo,
    since: getSinceAsString(new Date(conversation.createdAt)),
  };
}

export function formatTimestampAsString(timestampedItem: {
  createdAt: string;
}) {
  return `${new Date(timestampedItem.createdAt).toLocaleDateString()} ${new Date(timestampedItem.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
