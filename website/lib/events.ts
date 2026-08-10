export function getEventMainUrl({
  url,
  description,
}: {
  url: string | null;
  description: string | null;
}): string | null {
  if (!url) return null;
  if (description?.includes(url)) return null;
  return url;
}
