import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import env from "@/lib/env";
import { CacheKey } from "@/lib/types";

export async function POST(req: NextRequest) {
  const trace = new Trace(req);

  try {
    const secret = req.headers.get("x-webhook-secret");

    if (secret !== env().CMS_WEBHOOK_SECRET) {
      trace.pushError("invalid secret");
      trace.log(401);
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    revalidateTag("cachedEvents" satisfies CacheKey, { expire: 0 });

    trace.log();
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
