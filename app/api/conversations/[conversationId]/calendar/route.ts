import { NextRequest } from "next/server";

import selectConversationFromId from "@/lib/forum/selectConversationFromId";
import { getRequestLogger } from "@/lib/getRequestLogger";

function toIcsDate(dateStr: string): string {
  return (
    new Date(dateStr).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  );
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ conversationId: string }> }
) {
  const params = await ctx.params;
  const logger = getRequestLogger(req);
  const conversation = await selectConversationFromId(params.conversationId);

  if (!conversation || !conversation.startsAt) {
    logger.withError("conversation not found (or no date attached)").flush();
    return new Response(null, { status: 404 });
  }

  const start = toIcsDate(conversation.startsAt);
  const end = conversation.endsAt
    ? toIcsDate(conversation.endsAt)
    : toIcsDate(
        new Date(
          new Date(conversation.startsAt).getTime() + 60 * 60 * 1000
        ).toISOString()
      );

  const exportedAt = toIcsDate(new Date().toISOString());

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Chair de Poule//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${conversation.id}@lechairdepoule.fr`,
    `DTSTAMP:${exportedAt}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(conversation.title)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  logger.append({ ics });
  logger.flush();
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="event-${params.conversationId}.ics"`,
    },
  });
}
