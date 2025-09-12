import getUser from "@/lib/auth/getUser";
import insertMessageIntoMainConversation from "@/lib/forum/insertMessageIntoMainConversation";
import selectMainConversationMessages from "@/lib/forum/selectMainConversationMessages";
import { supabaseServerSide } from "@/lib/supabaseServerSide";
import { BroadCastKey, Message } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const opertationName = `${req.method} ${req.url}`;
  try {
    console.log(`[Operation]`, opertationName);
    const user = await getUser();

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );

    const parsedInputs = z
      .object({
        body: z.string(),
      })
      .safeParse(await req.json());

    if (!parsedInputs.success) {
      return NextResponse.json(
        { error: "le message non valide ne sera pas posté" },
        { status: 400 },
      );
    }

    const message = await insertMessageIntoMainConversation({
      body: parsedInputs.data.body,
      user,
    });

    if (!message) throw new Error(`cannot insert message ${parsedInputs.data}`);

    supabaseServerSide.channel("messages").send({
      type: "broadcast",
      event: "new_message" satisfies BroadCastKey,
      payload: message,
    });

    return NextResponse.json<Message>(
      { ...message, user: { pseudo: user.pseudo } },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error,
    );
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const opertationName = `${req.method} ${req.url}`;
  try {
    console.log(`[Operation]`, opertationName);
    const user = await getUser();

    if (!user || user.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );

    const messages = await selectMainConversationMessages();

    return NextResponse.json<{ messages: Message[] }>(
      { messages },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error,
    );
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 },
    );
  }
}
