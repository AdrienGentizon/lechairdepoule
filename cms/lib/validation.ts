import z from "zod";

export function nullableString(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);
}

const frLocaleError = z.locales.fr().localeError;

export const frErrorMap = ((issue) =>
  issue.code === "too_small" && issue.minimum === 1
    ? "requis"
    : frLocaleError(issue)) satisfies z.core.$ZodErrorMap;

export const OrganizationInputSchema = z.object({
  type: z
    .enum(["VENUE", "BAND", "ARTIST", "BOOKER", "OTHER"])
    .nullable()
    .transform((type) => (type === "OTHER" ? null : type)),
  name: z.string().trim().min(1).max(255),
  description: nullableString(5000),
  country: z.string().trim().min(1).max(255),
  zipcode: z.string().trim().min(1).max(32),
  city: z.string().trim().min(1).max(255),
  street: nullableString(255),
});

export type OrganizationInput = z.infer<typeof OrganizationInputSchema>;

export const EventInputSchema = z.object({
  type: z.enum(["EVENT", "RELEASE"]),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  startDate: z.iso.date(),
  startTime: nullableString(5).pipe(z.iso.time({ precision: -1 }).nullable()),
  endDate: nullableString(10).pipe(z.iso.date().nullable()),
  endTime: nullableString(5).pipe(z.iso.time({ precision: -1 }).nullable()),
  timezone: z.string().trim().min(1).max(64),
  price: nullableString(255),
  venue: nullableString(255),
  url: nullableString(2048).pipe(z.url().nullable()),
  cover: z
    .object({
      objectKey: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .nullable(),
});

export type EventInput = z.infer<typeof EventInputSchema>;

export const EventUpdateInputSchema = EventInputSchema.omit({
  type: true,
  cover: true,
}).extend({
  cover: z.discriminatedUnion("action", [
    z.object({ action: z.literal("KEEP") }),
    z.object({ action: z.literal("REMOVE") }),
    z.object({
      action: z.literal("REPLACE"),
      objectKey: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
  ]),
});

export type EventUpdateInput = z.infer<typeof EventUpdateInputSchema>;
