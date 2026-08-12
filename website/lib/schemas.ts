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

export const PriceSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null)
);

export const ConversationFormSchema = z.object({
  title: z
    .string()
    .min(1, "Titre obligatoire")
    .max(100, "Titre trop long (100 caractères max)"),
  description: z
    .string()
    .min(1, "Description obligatoire")
    .max(500, "Description trop longue (500 caractères max)"),
  startsAt: NullishDateSchema,
  endsAt: NullishDateSchema,
  price: PriceSchema,
  venue: z.string().nullish(),
  url: z.string().url("URL invalide").nullish(),
  closedToContributionsAt: NullishDateSchema,
});

export const EventFormSchema = z.object({
  title: z
    .string()
    .min(1, "Titre obligatoire")
    .max(100, "Titre trop long (100 caractères max)"),
  description: z
    .string()
    .min(1, "Description obligatoire")
    .max(500, "Description trop longue (500 caractères max)"),
  startsAt: z
    .string()
    .datetime({ offset: true, message: "Date de début obligatoire" }),
  endsAt: NullishDateSchema,
  price: PriceSchema,
  venue: z.string().nullish(),
  url: z.string().url("URL invalide").nullish(),
});
