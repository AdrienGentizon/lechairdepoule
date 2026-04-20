import z from "zod";

export const nullableDate = z.preprocess(
  (v) => (v === "" ? null : v),
  z.string().datetime({ offset: true }).nullable().optional()
);
