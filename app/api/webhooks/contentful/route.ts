import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { CollectionTag } from "@/lib/contentful";
import env from "@/lib/env";
import { logApiError, logApiOperation } from "@/lib/logger";

export async function POST(req: NextRequest) {
  logApiOperation(req);

  try {
    const requestHeaders = new Headers(req.headers);
    const secret = requestHeaders.get("x-vercel-reval-key");

    if (secret !== env().CONTENTFUL_WEBHOOK_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    revalidateTag("eventCollection" as CollectionTag);
    revalidateTag("itemCollection" as CollectionTag);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    logApiError(req, error);
  }
}
