import { getSinceAsString } from "../date";
import { Conversation } from "../types";

export function getConversationMetadataAsString(
  conversation: Omit<Conversation, "messages">
) {
  const author = `créé par ${conversation.createdBy.pseudo}`;
  const since = `${getSinceAsString(new Date(conversation.createdAt))}`;
  const showSince = ["EVENT", "RELEASE"].includes(conversation.type ?? "");
  return showSince ? [author, since].join(" ") : author;
}

export function formatTimestampAsString(timestampedItem: {
  createdAt: string;
}) {
  return `${new Date(timestampedItem.createdAt).toLocaleDateString()} ${new Date(timestampedItem.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
