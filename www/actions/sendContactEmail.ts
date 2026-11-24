"use server";

import { z } from "zod";

import ContactEmail from "@/components/Email/ContactEmail";
import env from "@/lib/env";
import sendEmail from "@/lib/mailing/sendEmail";

export default async function sendContactEmail(
  _prev: unknown,
  formData: FormData,
) {
  try {
    const parsedInputs = z
      .object({
        email: z.email(),
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

    const { error } = await sendEmail({
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
    console.error(`[ERROR] sendContactEmail ${error}`);
    return {
      status: 500,
      message: `Le message n'a pas pu être envoyé`,
    };
  }
}
