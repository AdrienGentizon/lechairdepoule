import { MessageCircle, MicVocal, Newspaper } from "lucide-react";

import { Conversation } from "@/lib/types";

export default function ConversationIcon({
  type,
  className,
}: {
  type: Conversation["type"];
  className?: string;
}) {
  if (type === "TOPIC") return <MessageCircle className={className} />;
  if (type === "EVENT") return <MicVocal className={className} />;
  if (type === "RELEASE") return <Newspaper className={className} />;
  return <></>;
}
