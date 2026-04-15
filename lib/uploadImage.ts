import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 750 * 1024;

function getValidDimension(dimension: FormDataEntryValue | null) {
  if (!dimension) return;
  const value = parseInt(dimension.toString());
  if (isNaN(value)) return;

  return value;
}

export function getImageFileWithMetadata(
  formData: FormData
):
  | { success: true; data: { file: File; width: number; height: number } }
  | { success: false; error: string } {
  const file = formData.get("coverFile");
  if (!(file instanceof File))
    return {
      success: false,
      error: `invalid file`,
    };
  if (file.size === 0)
    return {
      success: false,
      error: `empty file`,
    };

  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      error: `${file.type} cannot be upload as image`,
    };
  }
  const width = getValidDimension(formData.get("coverWidth"));
  const height = getValidDimension(formData.get("coverHeight"));
  if (!width || !height) {
    return {
      success: false,
      error: "cannot determine width/height",
    };
  }

  return {
    success: true,
    data: {
      file,
      width,
      height,
    },
  };
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
