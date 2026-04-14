import { Conversation, Message } from "../types";

function getTimeSince(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return { value: 0, range: "instant" };
  if (minutes < 60) return { value: minutes, range: "minutes" };
  if (hours < 24) return { value: hours, range: "hours" };
  if (days < 7) return { value: days, range: "jours" };
  if (weeks < 4) return { value: weeks, range: "semaines" };
  return { value: months, range: "mois" };
}

function getSinceAsString(date: Date) {
  const since = getTimeSince(date);

  if (since.range === "instant" || since.value === 0) {
    return `à l'instant`;
  }
  return `il y a ${since.value} ${since.range}`;
}

export function getConversationMetadataAsString(
  conversation: Omit<Conversation, "messages">
) {
  return `créé par ${conversation.createdBy.pseudo} ${getSinceAsString(new Date(conversation.createdAt))}`;
}

export function getMessageMetadataAsString(message: Message) {
  return `${new Date(message.createdAt).toLocaleDateString()} ${new Date(message.createdAt).toLocaleTimeString()}`;
}
