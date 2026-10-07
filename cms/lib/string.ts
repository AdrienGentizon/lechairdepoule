export function obfuscateEmail(email: string) {
  const [handle, domain] = email.split("@");

  if (!handle || !domain) return email;

  const obfuscatedHandle =
    handle.length <= 2
      ? `${handle.at(0)}***`
      : `${handle.at(0)}***${handle.at(-1)}`;

  return `${obfuscatedHandle}@${domain}`;
}
