import z from "zod";

export const ConversationFormSchema = z.object({
  title: z
    .string()
    .min(1, "Titre obligatoire")
    .max(100, "Titre trop long (100 caractères max)"),
  description: z
    .string()
    .min(1, "Description obligatoire")
    .max(500, "Description trop longue (500 caractères max)"),
});

export const CoverInputSchema = z.object({
  objectKey: z.string().min(1),
  width: z.coerce.number().int().positive(),
  height: z.coerce.number().int().positive(),
});

export const ConversationInputSchema = ConversationFormSchema.extend({
  cover: CoverInputSchema.nullable(),
});

export type ConversationInput = z.infer<typeof ConversationInputSchema>;

export const BanAppealFormSchema = z.object({
  body: z
    .string()
    .min(10, "Message trop court (10 caractères min)")
    .max(1000, "Message trop long (1000 caractères max)"),
});
