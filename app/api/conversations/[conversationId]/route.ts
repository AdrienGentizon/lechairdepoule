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

    const parsedInputs = z
      .object({
        title: z.optional(z.string()),
        description: z.optional(z.string()),
      })
      .safeParse(await req.json());

    if (!parsedInputs.success) {
      return NextResponse.json(
        {
          error: "modification non valide la conversation ne sera pas mofifiée",
        },
        { status: 400 }
      );
    }

    const conversation = await updateConversationFromId({
      userId: user.id,
      conversationId: params.conversationId,
      payload: parsedInputs.data,
    });

    if (!conversation)
      return NextResponse.json(
        {
          error: "not found",
        },
        { status: 404 }
      );
    return NextResponse.json<{
      id: string;
      title: string;
      description: string;
    }>(conversation, {
      status: 200,
    });
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
