import { del } from "@vercel/blob";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import deleteConversationFromId from "@/lib/forum/deleteConversationFromId";
import insertMessageIntoConversation from "@/lib/forum/insertMessageIntoConversation";
import selectConversationFromId from "@/lib/forum/selectConversationFromId";
import selectConversationMessages from "@/lib/forum/selectConversationMessages";
import updateConversationFromId from "@/lib/forum/updateConversationFromId";
import pusher from "@/lib/pusher";
import { Conversation, Message } from "@/lib/types";
import uploadImage from "@/lib/uploadImage";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const opertationName = `${req.method} ${req.url}`;
  const params = await ctx.params;
  try {
    console.log(`[Operation]`, opertationName);
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
    return NextResponse.json<Conversation>(
      { ...conversation, messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error
    );
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
  const opertationName = `${req.method} ${req.url}`;
  const params = await ctx.params;
  try {
    console.log(`[Operation]`, opertationName);
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

    const message = await insertMessageIntoConversation({
      conversationId: params.conversationId,
      parentMessageId: parsedInputs.data.parentMessageId,
      body: parsedInputs.data.body,
      user: {
        ...user,
        pseudo: getUserPseudo(user),
      },
    });

    if (!message) throw new Error(`cannot insert message ${parsedInputs.data}`);

    await pusher.trigger(
      `conversations-${params.conversationId}`,
      "conversation:message:new",
      message
    );

    return NextResponse.json<Message>(message, { status: 200 });
  } catch (error) {
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error
    );
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
  const opertationName = `${req.method} ${req.url}`;
  const params = await ctx.params;
  try {
    console.log(`[Operation]`, opertationName);
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
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error
    );
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
  const opertationName = `${req.method} ${req.url}`;
  const params = await ctx.params;
  try {
    console.log(`[Operation]`, opertationName);
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
      console.error(`[Error] ${opertationName} ${parsedInputs.error.message}`);
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

    // TODO delete previous conversation cover
    if (cover && conversation.previousCoverUrl) {
      console.log(
        `[Operation] conversation ${conversation.id} cover has been replaced, its previous cover is going to be deleted`
      );
      await del(conversation.previousCoverUrl);
      console.log(
        `[Operation] delete blob successful ${conversation.previousCoverUrl}`
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
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error
    );
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}
