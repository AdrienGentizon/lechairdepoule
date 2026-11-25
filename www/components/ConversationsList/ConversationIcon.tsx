import {
  ChatCircleIcon,
  IconProps,
  MicrophoneStageIcon,
  NewspaperIcon,
} from "@phosphor-icons/react";

export default function ConversationIcon({
  type,
  ...props
}: IconProps & {
  type: "TOPIC" | "EVENT" | "RELEASE";
}) {
  const disabledIcon = true;
  if (disabledIcon) return <></>;
  if (type === "TOPIC") return <ChatCircleIcon {...props} />;
  if (type === "EVENT") return <MicrophoneStageIcon {...props} />;
  if (type === "RELEASE") return <NewspaperIcon {...props} />;
  return <></>;
}
