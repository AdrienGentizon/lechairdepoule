export default function obfuscateEmail(email: string) {
  const [local, domain] = email.split("@");

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }

  const start = local.slice(0, 2);
  const end = local.slice(-1);

  return `${start}***${end}@${domain}`;
}
