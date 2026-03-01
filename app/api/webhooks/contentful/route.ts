import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { CollectionTag } from "@/lib/contentful";
import env from "@/lib/env";
import { getRequestLogger } from "@/lib/getRequestLogger";

export async function POST(req: NextRequest) {
  const logger = getRequestLogger(req);
  logger.append({ timestamp: new Date().toISOString() });

  try {
    const requestHeaders = new Headers(req.headers);
    const secret = requestHeaders.get("x-vercel-reval-key");

    if (secret !== env().CONTENTFUL_WEBHOOK_SECRET) {
      logger.withError("invalid secret").flush();
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    revalidateTag("eventCollection" as CollectionTag);
    revalidateTag("itemCollection" as CollectionTag);

    logger.flush();
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json(
      { revalidated: false, now: Date.now() },
      { status: 500 }
    );
  }
}
