"use server";

import ContactEmail from "@/components/ContactEmail/ContactEmail";
import env from "@/lib/env";
import resend from "@/lib/resend";
import { z } from "zod";

export default async function sendEmail(_prev: unknown, formData: FormData) {
  try {
    const parsedInputs = z
      .object({
        email: z.string().email(),
        subject: z.string().optional(),
        message: z.string().min(1, {
          message: "Le message est vide",
        }),
      })
      .safeParse(Object.fromEntries(formData.entries()));

    if (!parsedInputs.success) {
      return {
        status: 400,
        message: `Le message ne peut pas être envoyé: email et message sont requis.`,
      };
    }

    const { error } = await resend.emails.send({
      from: "Le Chair de Poule <noreply@lechairdepoule.fr>",
      to: env().RESEND_TO_EMAIL.split(","),
      replyTo: parsedInputs.data.email,
      subject: parsedInputs.data.subject ?? "",
      react: ContactEmail({
        subject: parsedInputs.data.subject ?? "Demande d'information",
        message: parsedInputs.data.message,
        from: parsedInputs.data.email,
      }),
    });
    if (error) throw new Error(`${error.name} ${error.message}`);

    return {
      status: 200,
      message: `Le message a été envoyé`,
    };
  } catch (error) {
    console.error(`[ERROR] sendEmail ${error}`);
    return {
      status: 500,
      message: `Le message n'a pas pu être envoyé`,
    };
  }
}
