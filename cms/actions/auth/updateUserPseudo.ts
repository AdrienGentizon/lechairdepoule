"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import getLoggableUser from "@cdp/lib/getLoggableUser";
import Trace from "@cdp/lib/trace";
import { Result } from "@cdp/lib/types";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import selectUserFromPseudo from "@/lib/auth/selectUserFromPseudo";
import updateUserPseudoInDb from "@/lib/auth/updateUserPseudo";

export default async function updateUserPseudo(inputs: {
  pseudo: string;
}): Promise<Result<null>> {
  const trace = new Trace(`updateUserPseudo`);
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.bannedAt) {
      trace.log(401);
      return { success: false, error: "unauthorized" };
    }
    trace.push(getLoggableUser(user));

    const parsedInputs = z
      .object({ pseudo: z.string().trim().min(3).max(50) })
      .safeParse(inputs);

    if (!parsedInputs.success) {
      trace.push(parsedInputs.error.message);
      trace.log(400);
      return { success: false, error: "bad_request" };
    }

    const userWithSamePseudo = await selectUserFromPseudo({
      pseudo: parsedInputs.data.pseudo,
    });

    if (userWithSamePseudo && userWithSamePseudo.id !== user.id) {
      trace.log(409);
      return { success: false, error: "pseudo_taken" };
    }

    const updatedUser = await updateUserPseudoInDb({
      userId: user.id,
      pseudo: parsedInputs.data.pseudo,
    });

    if (!updatedUser) {
      trace.pushError("cannot update user pseudo");
      trace.log(500);
      return { success: false, error: "server_error" };
    }

    revalidatePath("/profile");
    trace.log();
    return { success: true, data: null };
  } catch (error) {
    trace.pushError(error);
    trace.log(500);

    return { success: false, error: "server_error" };
  }
}
