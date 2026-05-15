import { del } from "@vercel/blob";

import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import deleteConversationCoverFromId from "@/lib/forum/deleteConversationCoverFromId";
import selectConversationFromId from "@/lib/forum/selectConversationFromId";
import updateConversationCoverFromId from "@/lib/forum/updateConversationCoverFromId";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { CacheKey, SimpleConversation } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();

    const imageFileWithMetadata = await getImageFileWithMetadata(formData);

    if (!imageFileWithMetadata.success) {
      logger.append({ formData });
      logger.withError("invalid payload").flush();
      return NextResponse.json({ error: "image non valide." }, { status: 400 });
    }

    const uploadedImage = await uploadImage(imageFileWithMetadata.data);
    if (!uploadedImage.success) {
      logger.append({ uploadError: uploadedImage.error });
      logger.withError("upload failed").flush();
      return NextResponse.json(
        { error: "l'image n'a pas pu être chargée" },
        { status: 500 }
      );
    }

    const values = {
      userId: user.id,
      conversationId: params.conversationId,
      cover: uploadedImage.data,
    };
    const updatedConversation = await updateConversationCoverFromId(values);

    if (!updatedConversation) {
      logger.append({ values });
      logger.withError("cannot update conversation cover").flush();
      return NextResponse.json(
        { error: "l'image n'a pas pu être sauvegardée" },
        { status: 500 }
      );
    }

    if (updatedConversation.previousCoverUrl) {
      await del(updatedConversation.previousCoverUrl);
    }

    revalidateTag("cachedAgenda" satisfies CacheKey, "max");
    logger.append({ updatedConversation });
    logger.flush();
    return NextResponse.json<SimpleConversation>(updatedConversation, {
      status: 200,
    });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const conversation = await selectConversationFromId(params.conversationId);

    if (!conversation) {
      logger.withError("not found").flush();
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }

    const updatedConversation = await deleteConversationCoverFromId({
      conversationId: params.conversationId,
      userId: user.id,
    });

    if (!updatedConversation) {
      logger.withError("cannot delete conversation cover").flush();
      return NextResponse.json(
        { error: "impossible de supprimer l'image" },
        { status: 500 }
      );
    }

    if (conversation.coverUrl) {
      await del(conversation.coverUrl);
    }

    revalidateTag("cachedAgenda" satisfies CacheKey, "max");
    logger.append({ conversationId: updatedConversation.id });
    logger.flush();
    return NextResponse.json<SimpleConversation>(updatedConversation, {
      status: 200,
    });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
