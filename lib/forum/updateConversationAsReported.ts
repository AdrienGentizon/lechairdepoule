import sql from "../db";

export default async function updateConversationAsReported({
  conversationId,
  reportedBy,
}: {
  conversationId: string;
  reportedBy: { id: string };
}) {
  return (
    await sql<
      {
        id: string;
        title: string;
        description: string | null;
        type: string | null;
        reportedAt: string | null;
        createdAt: string;
        userId: string;
        userPseudo: string | null;
        userBannedAt: string | null;
      }[]
    >`
    UPDATE public.conversations c
    SET
      reported_by = ${reportedBy.id},
      reported_at = ${new Date().toISOString()}
    FROM public.users u
    WHERE c.id = ${conversationId}
      AND c.reported_at IS NULL
      AND u.id = c.created_by
    RETURNING
      c.id::text,
      c.title,
      c.description,
      c.type,
      c.reported_at::text AS "reportedAt",
      c.created_at::text AS "createdAt",
      u.id::text AS "userId",
      u.pseudo AS "userPseudo",
      u.banned_at::text AS "userBannedAt";`
  )
    .map(
      ({ userId, userPseudo, userBannedAt, ...conversation }) => ({
      ...conversation,
      createdBy: { id: userId, pseudo: userPseudo ?? "", bannedAt: userBannedAt },
    })
    )
    .at(0);
}
