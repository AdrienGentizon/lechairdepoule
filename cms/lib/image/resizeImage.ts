import { Result } from "@cdp/lib/types";

const MAX_DIMENSION_IN_PIXELS = 1200;
const WEBP_QUALITY = 0.8;

export default async function resizeImage(
  file: File,
): Promise<Result<{ file: File; width: number; height: number }>> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION_IN_PIXELS / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return { success: false, error: "upload_failed" };
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    if (!blob) return { success: false, error: "upload_failed" };

    return {
      success: true,
      data: {
        file: new File([blob], file.name, { type: blob.type }),
        width,
        height,
      },
    };
  } catch {
    return { success: false, error: "unsupported_file_type" };
  }
}
