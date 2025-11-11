import getUser from "@/lib/auth/getUser";
import getUserPseudo from "@/lib/auth/getUserPseudo";
import insertConversation from "@/lib/forum/insertConversation";
import selectConversations from "@/lib/forum/selectConversations";
import { Conversation } from "@/lib/types";
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
        title: z.string(),
        description: z.string(),
      })
      .safeParse(await req.json());

    if (!parsedInputs.success) {
      return NextResponse.json(
        { error: "conversation non valide ne sera pas créée" },
        { status: 400 },
      );
    }

    const conversation = await insertConversation({
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      user: { ...user, pseudo: getUserPseudo(user) },
    });

    if (!conversation)
      throw new Error(`cannot insert conversation ${parsedInputs.data}`);

    return NextResponse.json<Conversation>(conversation, { status: 200 });
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

    const conversations = await selectConversations();

    return NextResponse.json<Omit<Conversation, "messages">[]>(conversations, {
      status: 200,
    });
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
