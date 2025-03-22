import { Tag } from "@/lib/contentful";
import env from "@/lib/env";
import { logApiError, logApiOperation } from "@/lib/logger";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  logApiOperation(`WEBHOOKS`, req);

  try {
    const requestHeaders = new Headers(req.headers);
    const secret = requestHeaders.get("x-vercel-reval-key");

    if (secret !== env().CONTENTFUL_WEBHOOK_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    revalidateTag("eventCollection" as Tag);
    revalidateTag("itemCollection" as Tag);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    logApiError("WEBHOOKS", req, error);
  }
}
