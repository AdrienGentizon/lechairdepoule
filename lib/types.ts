export type RawUser = {
  id: number;
  email: string;
  pseudo: string | null;
  role: string | null;
  createdAt: string;
  bannedAt: string | null;
  deletedAt: string | null;
  lastConnection: string | null;
};

export type User = {
  id: string;
  email: string;
  pseudo: string;
  role: string | null;
  createdAt: string;
  bannedAt: string | null;
  deletedAt: string | null;
  lastConnection: string | null;
};

export type RawMessage = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string | null;
  reported_at: string | null;
  conversation_id: string;
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
  user: {
    id: string;
    pseudo: string;
    bannedAt: string | null;
  };
};

export type Conversation = {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  createdAt: string;
  createdBy: {
    id: string;
    pseudo: string;
    bannedAt: string | null;
  };
  messages: Message[];
};

export type CacheKey =
  | "me"
  | `conversation-${string}`
  | "conversations"
  | "users";

export type BroadCastKey = "new_message" | "reported_message" | "banned_user";

export type BroadcastPayload<K = BroadCastKey, T = Record<string, unknown>> = {
  type: "broadcast";
  event: K;
  payload: T;
};

export type TermsOfService = {
  sys: { id: string };
  cgu: string;
};
