import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 750 * 1024;

function getValidDimension(dimension: FormDataEntryValue | null) {
  if (!dimension) return;
  const value = parseInt(dimension.toString());
  if (isNaN(value)) return;

  return value;
}

async function isValidImageMagicBytes(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
  // GIF87a / GIF89a
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;
  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return true;
  return false;
}

export async function getImageFileWithMetadata(
  formData: FormData
): Promise<
  | { success: true; data: { file: File; width: number; height: number } }
  | { success: false; error: string }
> {
  const file = formData.get("coverFile");
  if (!(file instanceof File))
    return { success: false, error: `invalid file` };
  if (file.size === 0)
    return { success: false, error: `empty file` };
  if (!(await isValidImageMagicBytes(file)))
    return { success: false, error: `file is not a valid image` };

  const width = getValidDimension(formData.get("coverWidth"));
  const height = getValidDimension(formData.get("coverHeight"));
  if (!width || !height)
    return { success: false, error: "cannot determine width/height" };

  return { success: true, data: { file, width, height } };
}

export default async function uploadImage(image: {
  file: File;
  width: number;
  height: number;
}): Promise<
  | { success: true; data: { url: string; width: number; height: number } }
  | { success: false; error: string }
> {
  try {
    if (image.file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `file size ${image.file.size} exceeds ${MAX_FILE_SIZE / 1024}KB limit`,
      };
    }

    const blob = await put(image.file.name, image.file, {
      access: "public",
      addRandomSuffix: true,
    });

    return {
      success: true,
      data: {
        url: blob.url,
        width: image.width,
        height: image.height,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `${(error as Error)?.message ?? error}`,
    };
  }
}
