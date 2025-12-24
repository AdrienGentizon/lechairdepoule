import sql from "../db";

export default async function updateConversationFromId({
  conversationId,
  userId,
  title,
  description,
  cover,
}: {
  conversationId: string;
  userId: string;
  title: string;
  description: string;
  cover?: {
    url: string;
    width: number;
    height: number;
  };
}) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string;
        coverUrl: string | null;
        coverWidth: string | null;
        coverHeight: string | null;
        previousCoverUrl: string | null;
      }[]
    >`WITH previous AS (SELECT image_url FROM public.conversations WHERE id = ${conversationId} AND created_by = ${userId})
    UPDATE public.conversations
      SET
        title = ${title},
        description = ${description},
        image_url = COALESCE(${cover?.url ?? null}, image_url),
        image_width = COALESCE(${cover?.width ?? null}, image_width),
        image_height = COALESCE(${cover?.height ?? null}, image_height)
      WHERE
        id = ${conversationId}
        AND created_by = ${userId}
      RETURNING
        id::text,
        title,
        description,
        image_url as "coverUrl",
        image_width as "coverWidth",
        image_height as "coverHeight",
        (SELECT image_url FROM previous) AS "previousCoverUrl";`
  ).at(0);
}
