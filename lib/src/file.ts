import z from "zod";

export const ALLOWED_IMAGE_TYPES = [
  { mime: "image/jpeg", extensions: [".jpg", ".jpeg"] },
  { mime: "image/png", extensions: [".png"] },
  { mime: "image/webp", extensions: [".webp"] },
] as const;

export const ALLOWED_IMAGE_MIMES = ALLOWED_IMAGE_TYPES.map(({ mime }) => mime);

export const MAX_IMAGE_SIZE_IN_BYTES = 1024 * 1024;

export function isAllowedImageMime(
  mime: string | undefined,
): mime is (typeof ALLOWED_IMAGE_MIMES)[number] {
  return ALLOWED_IMAGE_MIMES.some((allowedMime) => allowedMime === mime);
}

export const ImageUploadInputSchema = z.object({
  contentType: z.enum(ALLOWED_IMAGE_MIMES),
  size: z.number().int().positive().max(MAX_IMAGE_SIZE_IN_BYTES),
});
