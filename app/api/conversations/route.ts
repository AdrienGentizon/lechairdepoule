import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import { canCreateConversation } from "@/lib/auth/permissions";
import insertConversation from "@/lib/forum/insertConversation";
import selectConversations from "@/lib/forum/selectConversations";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { Conversation } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

export async function POST(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);

    if (!user || !canCreateConversation(user)) {
      logger.append(getLoggableUser(user));
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries());

    const parsedInputs = z
      .object({
        title: z.string(),
        description: z.string(),
        type: z.string(),
      })
      .safeParse(payload);

    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json(
        { error: "conversation non valide ne sera pas créée" },
        { status: 400 }
      );
    }

    const imageFileWithMetadata = getImageFileWithMetadata(formData);
    let cover: { url: string; width: number; height: number } | undefined =
      undefined;

    if (imageFileWithMetadata.success) {
      const uploadResult = await uploadImage(imageFileWithMetadata.data);
      if (uploadResult.success) {
        cover = uploadResult.data;
      } else {
        logger.append({ uploadError: uploadResult.error });
      }
    }

    const insertedConversation = await insertConversation({
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      type: parsedInputs.data.type,
      user: { ...user, pseudo: getUserPseudo(user) },
      cover,
    });

    if (!insertedConversation)
      throw new Error(`cannot insert conversation ${parsedInputs.data}`);

    logger.append({ insertedConversation });
    logger.flush();
    return NextResponse.json<Conversation>(insertedConversation, {
      status: 200,
    });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const conversations = await selectConversations();

    logger.flush();
    return NextResponse.json<Omit<Conversation, "messages">[]>(conversations, {
      status: 200,
    });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
