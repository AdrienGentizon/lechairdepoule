export default function replaceMessageBodyMentionWIthUserId({
  mentionedUsers,
  body,
}: {
  mentionedUsers: { id: string; pseudo: string | null }[];
  body: string;
}) {
  return mentionedUsers.reduce((acc: string, curr) => {
    if (!curr.pseudo) return acc;
    return acc.replaceAll(`@${curr.pseudo}`, `@${curr.id}`);
  }, body);
}
