export type User = {
  id: string;
  email: string;
  pseudo: string;
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
