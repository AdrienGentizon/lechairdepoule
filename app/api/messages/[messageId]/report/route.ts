import getUser from "@/lib/auth/getUser";
import updateMessageAsReported from "@/lib/forum/updateMessageAsReported";
import { Message } from "@/lib/types";
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

    if (!reportedBy)
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        { status: 401 },
      );

    const message = await updateMessageAsReported({
      reportedBy,
      messageId,
    });

    if (!message)
      throw new Error(
        `user (${reportedBy.id}) cannot report message (${messageId})`,
      );

    return NextResponse.json<Message>(
      {
        ...message,
        body: "---redacted---",
      },
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
