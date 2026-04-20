import { del } from "@vercel/blob";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import { selectUsersFromId } from "@/lib/auth/selectUsersFromId";
import selectUsersFromPseudo from "@/lib/auth/selectUsersFromPseudo";
import deleteConversationFromId from "@/lib/forum/deleteConversationFromId";
import getLoggableMessage from "@/lib/forum/getLoggableMessage";
import getMentionedPseudos from "@/lib/forum/getMentionedPseudos";
import insertMentions from "@/lib/forum/insertMentions";
import insertMessageIntoConversation from "@/lib/forum/insertMessageIntoConversation";
import replaceMessageBodyMentionWIthUserId from "@/lib/forum/replaceMessageBodyMentionWIthUserId";
import replaceMessageBodyMentionWIthUserName from "@/lib/forum/replaceMessageBodyMentionWIthUserName";
import selectConversationFromId from "@/lib/forum/selectConversationFromId";
import selectConversationMessages from "@/lib/forum/selectConversationMessages";
import updateConversationFromId from "@/lib/forum/updateConversationFromId";
import upsertThreadNotifications from "@/lib/forum/upsertThreadNotifications";
import { getRequestLogger } from "@/lib/getRequestLogger";
import pusher from "@/lib/pusher";
import { nullableDate } from "@/lib/schemas";
import { Conversation, Message } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);
    logger.append(getLoggableUser(user));

    if (!user || user.bannedAt) {
      logger.withError(new Error("unauthorized")).flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const conversation = await selectConversationFromId(params.conversationId);

    if (!conversation || (conversation.reportedAt && user.role !== "admin")) {
      logger.withError("not found").flush();
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }

    const messages = await selectConversationMessages(params.conversationId);
    const mentionedUserIds = messages.reduce((acc: string[], curr) => {
      const mentionedUserIds = getMentionedPseudos(curr.body);
      return [
        ...acc.filter((id) => !mentionedUserIds.includes(id)),
        ...mentionedUserIds,
      ];
    }, []);

    const users = await selectUsersFromId(
      mentionedUserIds.map((mention) => mention.replace("@", ""))
    );
    const mentionedUsers = mentionedUserIds.reduce(
      (acc: { id: string; pseudo: string }[], curr) => {
        const user = users.find(({ id }) => `@${id}` === curr);
        if (!user?.pseudo) return acc;
        return [
          ...acc.filter(({ id }) => id !== user.id),
          { id: user.id, pseudo: user.pseudo },
        ];
      },
      []
    );

    logger.flush();
    return NextResponse.json<Conversation>(
      {
        ...conversation,
        messages: messages.map((message) => ({
          ...message,
          body: replaceMessageBodyMentionWIthUserName({
            mentionedUsers,
            body: message.body,
          }),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

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

    const payload = await req.json();
    const parsedInputs = z
      .object({
        body: z.string(),
        parentMessageId: z.nullable(z.string()),
      })
      .safeParse(payload);

    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json(
        { error: "message non valide ne sera pas posté" },
        { status: 400 }
      );
    }

    const mentions = getMentionedPseudos(parsedInputs.data.body);

    let mentionedUsers: { id: string; pseudo: string | null }[] = [];
    if (mentions.length > 0) {
      mentionedUsers = await selectUsersFromPseudo({
        pseudos: mentions.map((mention) => mention.replace("@", "")),
      });
    }

    const values = {
      conversationId: params.conversationId,
      parentMessageId: parsedInputs.data.parentMessageId,
      body: replaceMessageBodyMentionWIthUserId({
        mentionedUsers,
        body: parsedInputs.data.body,
      }),
      user: { ...user, pseudo: getUserPseudo(user) },
    };
    const insertedMessage = await insertMessageIntoConversation(values);

    if (!insertedMessage) {
      logger.append({ values });
      throw new Error(`cannot insert message`);
    }
    logger.append(getLoggableMessage(insertedMessage));

    await insertMentions({
      messageId: insertedMessage.id,
      userIds: mentionedUsers.map(({ id }) => id),
    });

    if (parsedInputs.data.parentMessageId) {
      await upsertThreadNotifications({
        parentMessageId: parsedInputs.data.parentMessageId,
        newMessageId: insertedMessage.id,
        senderId: user.id,
      });
    }

    await pusher.trigger(
      `conversations-${params.conversationId}`,
      "conversation:message:new",
      insertedMessage
    );

    logger.append({ insertedMessage: getLoggableMessage(insertedMessage) });
    logger.flush();
    return NextResponse.json<Message>(
      {
        ...insertedMessage,
        body: replaceMessageBodyMentionWIthUserName({
          mentionedUsers,
          body: insertedMessage.body,
        }),
      },
      { status: 200 }
    );
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

    const conversation = await deleteConversationFromId({
      userId: user.id,
      conversationId: params.conversationId,
    });

    if (!conversation) {
      logger.withError("not found").flush();
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }

    logger.flush();
    return NextResponse.json<{ conversationId: string }>(
      { conversationId: conversation.id },
      { status: 200 }
    );
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
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
    const payload = Object.fromEntries(formData.entries());

    const parsedInputs = z
      .object({
        title: z.string(),
        description: z.string(),
        startsAt: nullableDate,
        endsAt: nullableDate,
      })
      .safeParse(payload);

    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json(
        {
          error: "modification non valide la conversation ne sera pas mofifiée",
        },
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

    const values = {
      userId: user.id,
      conversationId: params.conversationId,
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      cover,
      startsAt: parsedInputs.data.startsAt,
      endsAt: parsedInputs.data.endsAt,
    };
    const updatedConversation = await updateConversationFromId(values);

    if (!updatedConversation) {
      logger.append({ values });
      logger.withError("cannot update conversation").flush();
      return NextResponse.json(
        { error: "impossible de modifier la conversation" },
        { status: 500 }
      );
    }

    if (cover && updatedConversation.previousCoverUrl) {
      await del(updatedConversation.previousCoverUrl);
    }

    logger.append({ updatedConversation });
    logger.flush();
    return NextResponse.json<
      Omit<Conversation, "messages" | "createdAt" | "createdBy">
    >(updatedConversation, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
