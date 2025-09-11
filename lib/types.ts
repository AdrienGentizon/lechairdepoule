export type User = {
  id: string;
  email: string;
  pseudo: string;
  role: string;
  createdAt: string;
  bannedAt: string | null;
  deletedAt: string | null;
  lastConnection: string | null;
};

export type Message = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
  reportedAt: string | null;
  reportedBy: string | null;
  userId: string;
  conversationId: string | null;
};

export type Conversation = {
  id: string;
  title: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
};

export type CacheKey = "me" | "main-conversation";

export type BroadCastKey = "new_message";

export type BroadcastPayload<K = BroadCastKey, T = Record<string, unknown>> = {
  type: "broadcast";
  event: K;
  payload: T;
};
