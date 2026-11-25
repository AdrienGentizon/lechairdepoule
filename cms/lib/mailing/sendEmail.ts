import resend from "@/lib/resend";

export default async function sendEmail({
  subject,
  to,
  replyTo,
  react,
}: Pick<
  Parameters<typeof resend.emails.send>[0],
  "subject" | "to" | "replyTo" | "react"
>) {
  if (process.env.MAILING_SERVICE_STATUS === "disabled")
    return {
      error: {
        name: "disabled",
        message: `env.MAILING_SERVICE_STATUS sets to 'disabled'`,
      },
    };

  return resend.emails.send({
    from: "Le Chair de Poule <noreply@lechairdepoule.fr>",
    to,
    replyTo,
    subject,
    react,
  });
}
