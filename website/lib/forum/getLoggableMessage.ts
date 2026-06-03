import { Message, RawMessage } from "../types";

export default function getLoggableMessage(message?: RawMessage | Message) {
  if (!message) return { message: null };

  const { body, ...rest } = message;
  return {
    ...rest,
    body: `${body.substring(0, 10)}...`,
  };
}
