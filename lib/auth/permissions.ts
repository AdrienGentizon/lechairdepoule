import { User } from "@/lib/types";

export const canBanUser = (
  user: Omit<User, "pseudo">,
  targetUserId: string
): boolean => {
  if (!user) return false;
  if (user.bannedAt) return false;
  if (user.role !== "admin") return false;
  if (user.id === targetUserId) return false;
  return true;
};

export const canReportMessage = (user: Omit<User, "pseudo">): boolean => {
  if (user.bannedAt) return false;
  return true;
};

export const canPostMessage = (user: Omit<User, "pseudo">): boolean => {
  if (user.bannedAt) return false;
  return true;
};

export const canUpdateConversation = (user: Omit<User, "pseudo">): boolean => {
  if (user.bannedAt) return false;
  return true;
};

export const canDeleteConversation = (user: Omit<User, "pseudo">): boolean => {
  if (user.bannedAt) return false;
  return true;
};

export const canCreateConversation = (user: Omit<User, "pseudo">): boolean => {
  if (user.bannedAt) return false;
  return true;
};

export const canListReportedMessages = (user: Omit<User, "pseudo">): boolean => {
  if (user.role !== "admin") return false;
  return true;
};
