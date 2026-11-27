import z from "zod";

export const UserReportInputSchema = z.object({
  type: z.enum(["BUG", "QUESTION", "FEATURE"]),
  body: z.string().trim().min(10).max(2000),
  pageUrl: z.string().max(2000).nullish(),
});

export type UserReportInput = z.infer<typeof UserReportInputSchema>;
