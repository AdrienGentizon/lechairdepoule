import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import updateConversationAsReported from "@/lib/forum/updateConversationAsReported";
import pusher from "@/lib/pusher";
import { CacheKey } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params;
  const trace = new Trace(req);
  try {
    const reportedBy = await getAuthenticatedUser();
    trace.push({ reportedBy: getLoggableUser(reportedBy) });

    if (!reportedBy || reportedBy.bannedAt) {
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const values = { reportedBy, conversationId };
    const reportedConversation = await updateConversationAsReported(values);

    if (!reportedConversation) {
      trace.push({ values });
      throw new Error(
        `user (${reportedBy.id}) cannot report conversation (${conversationId})`,
      );
    }

    await pusher.trigger(
      `conversations`,
      `conversation:report`,
      reportedConversation,
    );

    revalidateTag("cachedAgenda" satisfies CacheKey, "max");
    trace.push({ reportedConversation });
    trace.log();
    return NextResponse.json(reportedConversation, { status: 200 });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
