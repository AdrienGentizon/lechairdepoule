import sql from "../db";

export default async function updateConversationFromId(
  {
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
  },
  options?: { forceDropCover?: boolean }
) {
  const forceDropCover = options?.forceDropCover === true;
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string;
        type: string | null;
        coverUrl: string | null;
        coverWidth: number | null;
        coverHeight: number | null;
        previousCoverUrl: string | null;
      }[]
    >`WITH previous AS (SELECT image_url FROM public.conversations WHERE id = ${conversationId} AND created_by = ${userId})
    UPDATE public.conversations
      SET
        title = ${title},
        description = ${description},
        image_url = CASE WHEN ${forceDropCover}::boolean THEN NULL ELSE COALESCE(${cover?.url ?? null}, image_url) END,
        image_width = CASE WHEN ${forceDropCover}::boolean THEN NULL ELSE COALESCE(${cover?.width ?? null}, image_width) END,
        image_height = CASE WHEN ${forceDropCover}::boolean THEN NULL ELSE COALESCE(${cover?.height ?? null}, image_height) END
      WHERE
        id = ${conversationId}
        AND created_by = ${userId}
      RETURNING
        id::text,
        title,
        description,
        type,
        image_url as "coverUrl",
        image_width::integer as "coverWidth",
        image_height::integer as "coverHeight",
        (SELECT image_url FROM previous) AS "previousCoverUrl";`
  ).at(0);
}
