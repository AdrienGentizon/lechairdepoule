import getUser from "@/lib/auth/getUser";
import updateMessageAsReported from "@/lib/forum/updateMessageAsReported";
import { supabaseServerSide } from "@/lib/supabaseServerSide";
import { BroadCastKey, Message } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { messageId: string } },
) {
  const opertationName = `${req.method} ${req.url}`;
  const { messageId } = await params;
  try {
    console.log(`[Operation]`, opertationName);
    const reportedBy = await getUser();

    if (!reportedBy || reportedBy.bannedAt)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );

    const reportedMessage = await updateMessageAsReported({
      reportedBy,
      messageId,
    });

    if (!reportedMessage)
      throw new Error(
        `user (${reportedBy.id}) cannot report message (${messageId})`,
      );

    supabaseServerSide.channel("messages").send({
      type: "broadcast",
      event: "reported_message" satisfies BroadCastKey,
      payload: reportedMessage,
    });

    return NextResponse.json<Message>(reportedMessage, {
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
