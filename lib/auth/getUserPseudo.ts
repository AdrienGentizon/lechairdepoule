export default function getUserPseudo(user: {
  pseudo: string | null;
  email: string;
}) {
  const mailbox = user.email.split("@").at(0) ?? "n/a";
  const shouldGetPseudoFromEmail = !user.pseudo || user.pseudo.length === 0;

  if (shouldGetPseudoFromEmail) {
    const separators = [".", "-", "_"];
    for (const separator of separators) {
      console.log(
        mailbox,
        mailbox.includes(separator),
        `${mailbox.split(separator).at(0)} ${mailbox.split(separator).at(1)}`,
      );
      if (mailbox.includes(separator))
        return `${mailbox.split(separator).at(0)} ${mailbox.split(separator).at(1)}`;
    }
    return mailbox;
  }

  return user.pseudo ?? mailbox;
}
