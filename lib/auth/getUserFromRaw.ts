import { RawUser, User } from "../types";
import getUserPseudo from "./getUserPseudo";

export function getUserFromRaw(raw: RawUser) {
  return {
    id: raw.id.toString(),
    email: raw.email,
    pseudo: getUserPseudo(raw),
    role: raw.role,
    createdAt: raw.createdAt,
    bannedAt: raw.bannedAt,
    deletedAt: raw.deletedAt,
    lastConnection: raw.lastConnection,
  } satisfies User;
}
