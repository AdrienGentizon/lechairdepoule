import { put } from "@vercel/blob";

function getValidDimension(dimension: FormDataEntryValue | null) {
  if (!dimension) return;
  const value = parseInt(dimension.toString());
  if (isNaN(value)) return;

  return value;
}

export default async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("coverFile");
    if (!(file instanceof File)) return;

    if (!file.type.startsWith("image/")) {
      console.warn(
        `[Warning] uploadImage: ${file.type} cannot be upload as image`
      );
      return;
    }
    if (file.size > 500 * 1024) {
      console.warn(
        `[Warning] uploadImage: ${file.size} exceeds ${500 * 1024} limit`
      );
      return;
    }

    const width = getValidDimension(formData.get("coverWidth"));
    const height = getValidDimension(formData.get("coverHeight"));
    if (!width || !height) {
      console.warn(`[Warning] uploadImage: cannot determine width/height`);
      return;
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    console.log(`[Operation] uploadImage successful ${blob.url}`);
    return {
      url: blob.url,
      width,
      height,
    };
  } catch (error) {
    console.error(`[Error] uploadImage ${(error as Error)?.message ?? error}`);
  }
}
