import { RawUser, User } from "../types";

export function getUserFromRaw(raw: RawUser) {
  return {
    id: raw.id.toString(),
    email: raw.email,
    pseudo: raw.pseudo,
    role: raw.role,
    createdAt: raw.createdAt,
    bannedAt: raw.bannedAt,
    deletedAt: raw.deletedAt,
    lastConnection: raw.lastConnection,
  } satisfies User;
}
