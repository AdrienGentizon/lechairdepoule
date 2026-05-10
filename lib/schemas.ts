import z from "zod";

export const NullishDateSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional()
    .transform((v) => v ?? null)
);

export const ConversationTypeEnum = z.enum(["TOPIC", "EVENT", "RELEASE"]);
