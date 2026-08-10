import { NextRequest } from "next/server";

import { buildIcsCalendar } from "@/lib/calendar/ics";
import { getRequestLogger } from "@/lib/getRequestLogger";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title");
  const startsAt = searchParams.get("startsAt");
  const endsAt = searchParams.get("endsAt");

  if (!title || !startsAt) {
    logger.withError("missing required params (title, startsAt)").flush();
    return new Response(null, { status: 400 });
  }

  const ics = buildIcsCalendar({ title, startsAt, endsAt });

  logger.append({ ics });
  logger.flush();
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="event.ics"`,
    },
  });
}
