import sql from "../db";
import { Conversation, isConversationType } from "../types";

const DEFAULT_TYPE = "TOPIC";

function getConversationFromRaw(
  raw: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    coverWidth: string | null;
    coverHeight: string | null;
    type: string;
    isPinned: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    reportedAt: string | null;
  },
  createdBy: { id: string; pseudo: string; bannedAt: string | null },
): Conversation {
  return {
    id: raw.id,
    type: isConversationType(raw.type) ? raw.type : "TOPIC",
    title: raw.title,
    description: raw.description,
    coverUrl: raw.coverUrl,
    coverWidth: raw.coverWidth ? parseInt(raw.coverWidth) : null,
    coverHeight: raw.coverHeight ? parseInt(raw.coverHeight) : null,
    isPinned: raw.isPinned,
    createdBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    deletedAt: raw.deletedAt,
    reportedAt: raw.reportedAt,
    messages: [],
  };
}

export default async function insertConversation({
  title,
  description,
  cover,
  user,
}: {
  title: string;
  description: string;
  cover?: {
    url: string;
    width: number;
    height: number;
  };
  user: { id: string; pseudo: string; bannedAt: string | null };
}) {
  return sql.begin(async (sql) => {
    const now = new Date();
    const insertedConversation = (
      await sql<
        {
          id: string;
          title: string;
          description: string | null;
          coverUrl: string | null;
          coverWidth: string | null;
          coverHeight: string | null;
          type: string;
          isPinned: boolean;
          createdBy: string;
          createdAt: string;
          updatedAt: string;
          deletedAt: string | null;
          reportedAt: string | null;
        }[]
      >`
    INSERT INTO
      conversations (title, description, image_url, image_width, image_height, type, created_by, created_at, updated_at)
    VALUES
      (${title}, ${description}, ${cover?.url ?? null}, ${cover?.width ?? null}, ${cover?.height ?? null}, ${DEFAULT_TYPE}, ${user.id}, ${now}, ${now})
    RETURNING
      id::text,
      title,
      description,
      image_url as "coverUrl",
      image_width as "coverWidth",
      image_height as "coverHeight",
      type,
      is_pinned,
      created_by::text,
      created_at::text,
      updated_at::text,
      deleted_at::text,
      reported_at::text;`
    ).at(0);

    if (!insertedConversation) {
      throw new Error("cannot insert conversation");
    }

    return getConversationFromRaw(insertedConversation, {
      id: user.id,
      pseudo: user.pseudo,
      bannedAt: user.bannedAt,
    });
  });
}
