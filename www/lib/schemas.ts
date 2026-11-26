import z from "zod";

export const NullishDateSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z.iso
    .date()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
);

export const NullishTimeSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z.iso
    .time({ precision: -1 })
    .nullable()
    .optional()
    .transform((v) => v ?? null),
);

export const TimezoneSchema = z.string().min(1, "Fuseau horaire obligatoire");

export const PriceSchema = z.preprocess(
  (v) => (v === "" ? null : v),
  z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
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

export const UserReportFormSchema = z.object({
  type: z.enum(["BUG", "QUESTION", "FEATURE"]),
  body: z
    .string()
    .min(10, "Message trop court (10 caractères min)")
    .max(2000, "Message trop long (2000 caractères max)"),
  pageUrl: z.string().max(2000).nullish(),
});

export const EventFormSchema = z.object({
  type: z.enum(["EVENT", "RELEASE"]),
  title: z
    .string()
    .min(1, "Titre obligatoire")
    .max(100, "Titre trop long (100 caractères max)"),
  description: z
    .string()
    .min(1, "Description obligatoire")
    .max(500, "Description trop longue (500 caractères max)"),
  startDate: z.iso.date({
    error: (issue) =>
      issue.input === undefined || issue.input === ""
        ? "Date de début obligatoire"
        : "Date de début invalide",
  }),
  startTime: NullishTimeSchema,
  endDate: NullishDateSchema,
  endTime: NullishTimeSchema,
  timezone: TimezoneSchema,
  price: PriceSchema,
  venue: z.string().nullish(),
  url: z.string().url("URL invalide").nullish(),
});
