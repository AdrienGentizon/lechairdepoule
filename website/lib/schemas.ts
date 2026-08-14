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

export const TimezoneSchema = z.string().min(1, "Fuseau horaire obligatoire");

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
});

export const EventTypeEnum = z.enum(["EVENT", "RELEASE"]);

export const EventFormSchema = z.object({
  type: EventTypeEnum,
  title: z
    .string()
    .min(1, "Titre obligatoire")
    .max(100, "Titre trop long (100 caractères max)"),
  description: z
    .string()
    .min(1, "Description obligatoire")
    .max(500, "Description trop longue (500 caractères max)"),
  startsAt: z
    .string({ required_error: "Date de début obligatoire" })
    .datetime({ offset: true, message: "Date de début invalide" }),
  endsAt: NullishDateSchema,
  timezone: TimezoneSchema,
  price: PriceSchema,
  venue: z.string().nullish(),
  url: z.string().url("URL invalide").nullish(),
});
