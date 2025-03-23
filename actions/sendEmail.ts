"use server";

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

    console.log(parsedInputs.data);
    const { error } = await resend.emails.send({
      from: parsedInputs.data.email,
      to: env().RESEND_TO_EMAIL,
      subject: parsedInputs.data.subject ?? "",
      text: parsedInputs.data.message,
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
