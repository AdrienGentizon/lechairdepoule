import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import getAuthenticatedUser from "@/lib/auth/getAuthenticatedUser";
import getLoggableUser from "@/lib/auth/getLoggableUser";
import insertConversation from "@/lib/forum/insertConversation";
import selectConversations from "@/lib/forum/selectConversations";
import { ConversationFormSchema } from "@/lib/schemas";
import { CacheKey, Conversation } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

export async function POST(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();

    if (!user || user.bannedAt) {
      trace.push(getLoggableUser(user));
      trace.pushError("unauthorized");
      trace.log(401);
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries());

    const parsedInputs = ConversationFormSchema.safeParse(payload);

    if (!parsedInputs.success) {
      trace.push({ payload });
      trace.pushError(parsedInputs.error);
      trace.log(400);
      return NextResponse.json(
        { error: "conversation non valide ne sera pas créée" },
        { status: 400 },
      );
    }

    const imageFileWithMetadata = await getImageFileWithMetadata(formData);
    let cover: { url: string; width: number; height: number } | undefined =
      undefined;

    if (imageFileWithMetadata.success) {
      const uploadResult = await uploadImage(imageFileWithMetadata.data);
      if (uploadResult.success) {
        cover = uploadResult.data;
      } else {
        trace.push({ uploadError: uploadResult.error });
      }
    }

    const insertedConversation = await insertConversation({
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      user: { id: user.id, pseudo: user.pseudo ?? "", bannedAt: user.bannedAt },
      cover,
    });

    if (!insertedConversation)
      throw new Error(`cannot insert conversation ${parsedInputs.data}`);

    revalidateTag("cachedAgenda" satisfies CacheKey, "max");
    trace.push({ insertedConversation });
    trace.log();
    return NextResponse.json<Conversation>(insertedConversation, {
      status: 200,
    });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
  try {
    const user = await getAuthenticatedUser();
    trace.push(getLoggableUser(user));

    const conversations = await selectConversations();

    trace.log();
    return NextResponse.json<Omit<Conversation, "messages">[]>(
      user?.role === "admin"
        ? conversations
        : conversations.filter(({ reportedAt }) => !reportedAt),
      { status: 200 },
    );
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
