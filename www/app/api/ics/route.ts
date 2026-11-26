import { NextRequest } from "next/server";

import Trace from "@cdp/lib/trace";

import { buildIcsCalendar } from "@/lib/calendar/ics";

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title");
  const startDate = searchParams.get("startDate");

  if (!title || !startDate) {
    trace.pushError("missing required params (title, startDate)");
    trace.log(400);
    return new Response(null, { status: 400 });
  }

  const ics = buildIcsCalendar({
    title,
    startDate,
    endDate: searchParams.get("endDate"),
    startsAt: searchParams.get("startsAt"),
    endsAt: searchParams.get("endsAt"),
  });

  trace.push({ ics });
  trace.log();
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="event.ics"`,
    },
  });
}
