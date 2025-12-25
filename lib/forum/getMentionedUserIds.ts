export default function getMentionedUserIds(body: string) {
  const mentionPattern = /@(\w+)/g;
  return Array.from(body.matchAll(mentionPattern)).reduce(
    (acc: string[], curr) => {
      const maybeMention = curr.at(0);
      if (!maybeMention) return acc;
      return [
        ...acc.filter((mention) => mention !== maybeMention),
        maybeMention,
      ];
    },
    []
  );
}
