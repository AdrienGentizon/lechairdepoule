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
  };
};

export type Conversation = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    pseudo: string;
  };
  messages: Message[];
};

export type CacheKey = "me" | `conversation-${string}` | "conversations";

export type BroadCastKey = "new_message" | "reported_message" | "banned_user";

export type BroadcastPayload<K = BroadCastKey, T = Record<string, unknown>> = {
  type: "broadcast";
  event: K;
  payload: T;
};
