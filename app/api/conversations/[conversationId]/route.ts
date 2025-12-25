import { del } from "@vercel/blob";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import selectUsersFromPseudo from "@/lib/auth/selectUsersFromPseudo";
import { selectUsersFromId } from "@/lib/auth/selecteUsersFromId";
import deleteConversationFromId from "@/lib/forum/deleteConversationFromId";
import getMentionedPseudos from "@/lib/forum/getMentionedPseudos";
import getMentionedUserIds from "@/lib/forum/getMentionedUserIds";
import insertMentions from "@/lib/forum/insertMentions";
import insertMessageIntoConversation from "@/lib/forum/insertMessageIntoConversation";
import replaceMessageBodyMentionWIthUserId from "@/lib/forum/replaceMessageBodyMentionWIthUserId";
import replaceMessageBodyMentionWIthUserName from "@/lib/forum/replaceMessageBodyMentionWIthUserName";
import selectConversationFromId from "@/lib/forum/selectConversationFromId";
import selectConversationMessages from "@/lib/forum/selectConversationMessages";
import updateConversationFromId from "@/lib/forum/updateConversationFromId";
import { logApiError, logApiOperation } from "@/lib/logger";
import pusher from "@/lib/pusher";
import { Conversation, Message } from "@/lib/types";
import uploadImage from "@/lib/uploadImage";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  try {
    logApiOperation(req);
    const user = await getUser(req);

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    const conversation = await selectConversationFromId(params.conversationId);

    if (!conversation)
      return NextResponse.json(
        {
          error: "not found",
        },
        { status: 404 }
      );
    const messages = await selectConversationMessages(params.conversationId);
    const mentionedUserIds = messages.reduce((acc: string[], curr) => {
      const mentionedUserIds = getMentionedUserIds(curr.body);
      return [
        ...acc.filter((id) => !mentionedUserIds.includes(id)),
        ...mentionedUserIds,
      ];
    }, []);

    const users = await selectUsersFromId(
      mentionedUserIds.map((mention) => {
        return mention.replace("@", "");
      })
    );
    const mentionedUsers = mentionedUserIds.reduce(
      (acc: { id: string; pseudo: string }[], curr) => {
        const user = users.find(({ id }) => `@${id}` === curr);
        if (!user?.pseudo) return acc;
        return [
          ...acc.filter(({ id }) => id !== user.id),
          {
            id: user.id,
            pseudo: user.pseudo,
          },
        ];
      },
      []
    );

    return NextResponse.json<Conversation>(
      {
        ...conversation,
        messages: messages.map((message) => {
          return {
            ...message,
            body: replaceMessageBodyMentionWIthUserName({
              mentionedUsers,
              body: message.body,
            }),
          };
        }),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    logApiError(req, error);
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  try {
    logApiOperation(req);
    const user = await getUser(req);

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    const parsedInputs = z
      .object({
        body: z.string(),
        parentMessageId: z.nullable(z.string()),
      })
      .safeParse(await req.json());

    if (!parsedInputs.success) {
      return NextResponse.json(
        { error: "message non valide ne sera pas posté" },
        { status: 400 }
      );
    }

    const mentions = getMentionedPseudos(parsedInputs.data.body);

    let mentionedUsers: { id: string; pseudo: string | null }[] = [];
    if (mentions.length > 0) {
      mentionedUsers = await selectUsersFromPseudo({
        pseudos: mentions.map((mention) => {
          return mention.replace("@", "");
        }),
      });
    }

    const message = await insertMessageIntoConversation({
      conversationId: params.conversationId,
      parentMessageId: parsedInputs.data.parentMessageId,
      body: replaceMessageBodyMentionWIthUserId({
        mentionedUsers,
        body: parsedInputs.data.body,
      }),
      user: {
        ...user,
        pseudo: getUserPseudo(user),
      },
    });

    if (!message) throw new Error(`cannot insert message ${parsedInputs.data}`);

    await insertMentions({
      messageId: message.id,
      userIds: mentionedUsers.map(({ id }) => id),
    });

    await pusher.trigger(
      `conversations-${params.conversationId}`,
      "conversation:message:new",
      message
    );

    return NextResponse.json<Message>(
      {
        ...message,
        body: replaceMessageBodyMentionWIthUserName({
          mentionedUsers,
          body: message.body,
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    logApiError(req, error);
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  try {
    logApiOperation(req);
    const user = await getUser(req);

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    const conversation = await deleteConversationFromId({
      userId: user.id,
      conversationId: params.conversationId,
    });

    if (!conversation)
      return NextResponse.json(
        {
          error: "not found",
        },
        { status: 404 }
      );
    return NextResponse.json<{ conversationId: string }>(
      { conversationId: conversation.id },
      {
        status: 200,
      }
    );
  } catch (error) {
    logApiError(req, error);
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  try {
    logApiOperation(req);
    const user = await getUser(req);

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 }
      );

    const formData = await req.formData();

    const parsedInputs = z
      .object({
        title: z.string(),
        description: z.string(),
      })
      .safeParse(Object.fromEntries(formData.entries()));

    if (!parsedInputs.success) {
      logApiError(req, parsedInputs.error.message);
      return NextResponse.json(
        {
          error: "modification non valide la conversation ne sera pas mofifiée",
        },
        { status: 400 }
      );
    }

    const cover = await uploadImage(formData);

    const conversation = await updateConversationFromId({
      userId: user.id,
      conversationId: params.conversationId,
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      cover,
    });

    if (!conversation)
      return NextResponse.json(
        {
          error: "not found",
        },
        { status: 404 }
      );

    if (cover && conversation.previousCoverUrl) {
      logApiOperation(
        req,
        `conversation ${conversation.id} cover has been replaced, its previous cover is going to be deleted`
      );

      await del(conversation.previousCoverUrl);
      logApiOperation(
        req,
        `delete blob successful ${conversation.previousCoverUrl}`
      );
    }
    return NextResponse.json<{
      id: string;
      title: string;
      description: string;
    }>(
      {
        id: conversation.id,
        title: conversation.title,
        description: conversation.description,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    logApiError(req, error);

    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}
