import { NextRequest, NextResponse } from "next/server";

import getLoggableUser from "@/lib/auth/getLoggableUser";
import getUser from "@/lib/auth/getUser";
import insertEvent from "@/lib/events/insertEvent";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { EventFormSchema } from "@/lib/schemas";
import { Event } from "@/lib/types";
import uploadImage, { getImageFileWithMetadata } from "@/lib/uploadImage";

export async function POST(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const user = await getUser(req);

    if (!user || user.bannedAt) {
      logger.append(getLoggableUser(user));
      logger.withError("unauthorized").flush();
      return NextResponse.json({ error: "non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries());

    const parsedInputs = EventFormSchema.safeParse(payload);

    if (!parsedInputs.success) {
      logger.append({ payload });
      logger.withError(parsedInputs.error).flush();
      return NextResponse.json(
        { error: "événement non valide ne sera pas créé" },
        { status: 400 }
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
        logger.append({ uploadError: uploadResult.error });
      }
    }

    const insertedEvent = await insertEvent({
      title: parsedInputs.data.title,
      description: parsedInputs.data.description,
      user: { id: user.id, pseudo: user.pseudo ?? "", bannedAt: user.bannedAt },
      cover,
      startsAt: parsedInputs.data.startsAt,
      endsAt: parsedInputs.data.endsAt,
      price: parsedInputs.data.price,
      venue: parsedInputs.data.venue,
      url: parsedInputs.data.url,
    });

    logger.append({ insertedEvent });
    logger.flush();
    return NextResponse.json<Event>(insertedEvent, { status: 200 });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
