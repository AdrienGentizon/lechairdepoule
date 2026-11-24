import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import { CollectionTag, EntryTag } from "@/lib/contentful";
import env from "@/lib/env";

export async function POST(req: NextRequest) {
  const trace = new Trace(req);
  trace.push({ timestamp: new Date().toISOString() });

  try {
    const requestHeaders = new Headers(req.headers);
    const secret = requestHeaders.get("x-vercel-reval-key");

    if (secret !== env().CONTENTFUL_WEBHOOK_SECRET) {
      trace.pushError("invalid secret");
      trace.log(401);
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    revalidateTag("eventCollection" as CollectionTag, {});
    revalidateTag("itemCollection" as CollectionTag, {});
    revalidateTag("albumCoverCollection" as CollectionTag, {});
    revalidateTag("contact" as EntryTag, {});

    trace.log();
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json(
      { revalidated: false, now: Date.now() },
      { status: 500 },
    );
  }
}
