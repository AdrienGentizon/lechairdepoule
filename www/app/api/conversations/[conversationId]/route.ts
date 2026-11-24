import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
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
import pusher from "@/lib/pusher";
import { ConversationFormSchema } from "@/lib/schemas";
import { CacheKey, Conversation, Message } from "@/lib/types";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> },
) {
  const params = await ctx.params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    const conversation = await selectConversationFromId(params.conversationId);

    if (!conversation || (conversation.reportedAt && user?.role !== "admin")) {
      trace.pushError("not found");
      trace.log(404);
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
      mentionedUserIds.map((mention) => mention.replace("@", "")),
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
      [],
    );

    trace.log();
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
      { status: 200 },
    );
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> },
) {
  const params = await ctx.params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const payload = await req.json();
    const parsedInputs = z
      .object({
        body: z.string().min(1).max(2000),
        parentMessageId: z.nullable(z.string()),
      })
      .safeParse(payload);

    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return NextResponse.json(
        { error: "message non valide ne sera pas posté" },
        { status: 400 },
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
      user: { id: user.id, pseudo: user.pseudo ?? "", bannedAt: user.bannedAt },
    };
    const insertedMessage = await insertMessageIntoConversation(values);

    if (!insertedMessage) {
      trace.push({ values });
      throw new Error(`cannot insert message`);
    }
    trace.push(getLoggableMessage(insertedMessage));

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
      insertedMessage,
    );

    trace.push({ insertedMessage: getLoggableMessage(insertedMessage) });
    trace.log();
    return NextResponse.json<Message>(
      {
        ...insertedMessage,
        body: replaceMessageBodyMentionWIthUserName({
          mentionedUsers,
          body: insertedMessage.body,
        }),
      },
      { status: 200 },
    );
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> },
) {
  const params = await ctx.params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const conversation = await deleteConversationFromId({
      userId: user.id,
      conversationId: params.conversationId,
    });

    if (!conversation) {
      trace.pushError("not found");
      trace.log(404);
      return NextResponse.json({ error: "introuvable" }, { status: 404 });
    }

    revalidateTag("cachedAgenda" satisfies CacheKey, "max");
    trace.log();
    return NextResponse.json<{ conversationId: string }>(
      { conversationId: conversation.id },
      { status: 200 },
    );
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> },
) {
  const params = await ctx.params;
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    if (!user || user.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const payload = Object.fromEntries((await req.formData()).entries());

    const parsedInputs = ConversationFormSchema.safeParse(payload);

    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return NextResponse.json(
        {
          error: "modification non valide la conversation ne sera pas mofifiée",
        },
        { status: 400 },
      );
    }

    const values = {
      userId: user.id,
      conversationId: params.conversationId,
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
    };
    const updatedConversation = await updateConversationFromId(values);

    if (!updatedConversation) {
      trace.push({ values });
      trace.pushError("cannot update conversation");
      trace.log(500);
      return NextResponse.json(
        { error: "impossible de modifier la conversation" },
        { status: 500 },
      );
    }
    revalidateTag("cachedAgenda" satisfies CacheKey, "max");

    trace.push({ updatedConversation });
    trace.log();
    return NextResponse.json<
      Omit<Conversation, "messages" | "createdAt" | "createdBy">
    >(updatedConversation, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
