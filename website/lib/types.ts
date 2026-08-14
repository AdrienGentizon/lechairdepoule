export type User = {
  id: string;
  pseudo: string | null;
  role: string | null;
  createdAt: string;
  bannedAt: string | null;
  deletedAt: string | null;
  tosAcceptedAt: string | null;
};

export type BanAppeal = {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type BannedUser = User & {
  appeal: { id: string; body: string; createdAt: string } | null;
};

export type RawMessage = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string | null;
  reported_at: string | null;
  conversation_id: string;
  parent_message_id: string | null;
  user_id: string;
  reported_by: string | null;
};

export type Message = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
  reportedAt: string | null;
  conversationId: string | null;
  parentMessageId: string | null;
  user: {
    id: string;
    pseudo: string;
    bannedAt: string | null;
  };
};

export type Event = {
  id: string;
  type: "EVENT" | "RELEASE";
  title: string;
  description: string | null;
  coverUrl: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  price: string | null;
  venue: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    pseudo: string;
  };
};

export function isEventType(
  type: ({} & string) | "EVENT" | "RELEASE"
): type is Event["type"] {
  return (["EVENT", "RELEASE"] satisfies Event["type"][]).includes(
    type as Event["type"]
  );
}

export type ContentfulEvent = Event & {
  shortDescription: string | null;
  atPeinePerdue: boolean;
};

export type Conversation = {
  id: string;
  type: "TOPIC";
  title: string;
  description: string | null;
  coverUrl: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  createdBy: {
    id: string;
    pseudo: string;
    bannedAt: string | null;
  };
  messages: Message[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  reportedAt: string | null;
};

export function isConversationType(
  type: ({} & string) | "TOPIC"
): type is Conversation["type"] {
  return (["TOPIC"] satisfies Conversation["type"][]).includes(
    type as Conversation["type"]
  );
}

export type PublicConversation = Omit<
  Conversation,
  "messages" | "reportedAt" | "isPinned" | "createdBy"
> & {
  createdBy: Omit<Conversation["createdBy"], "bannedAt">;
  startsAt: string;
};

export type SimpleConversation = Omit<Conversation, "messages" | "createdBy">;

export type UserMention = {
  id: string;
  messageId: string;
  conversationId: string | null;
  conversationTitle: string | null;
  excerpt: string;
  createdAt: string;
  readAt: string | null;
};

export type UserNotifications = {
  mentions: UserMention[];
  replies: UserMention[];
};

export type CacheKey =
  | "me"
  | `conversation-${string}`
  | "conversations"
  | "reported-messages"
  | "users"
  | "banned-users"
  | "cachedAgenda"
  | "cachedEvents";

export type BroadCastKey =
  | "new_message"
  | "reported_message"
  | "banned_user"
  | "reported_conversation";

export type BroadcastPayload<K = BroadCastKey, T = Record<string, unknown>> = {
  type: "broadcast";
  event: K;
  payload: T;
};

export type TermsOfService = {
  sys: { id: string };
  cgu: string;
};

export function isMessageWithConversationId(
  message: Message
): message is Message & { conversationId: string } {
  return message.conversationId !== null;
}
