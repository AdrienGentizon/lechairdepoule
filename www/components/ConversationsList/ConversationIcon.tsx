import { ComponentProps } from "react";

import { LucideIcon, MessageCircle, MicVocal, Newspaper } from "lucide-react";

export default function ConversationIcon({
  type,
  ...props
}: Omit<ComponentProps<LucideIcon>, "type"> & {
  type: "TOPIC" | "EVENT" | "RELEASE";
}) {
  const disabledIcon = true;
  if (disabledIcon) return <></>;
  if (type === "TOPIC") return <MessageCircle {...props} />;
  if (type === "EVENT") return <MicVocal {...props} />;
  if (type === "RELEASE") return <Newspaper {...props} />;
  return <></>;
}
