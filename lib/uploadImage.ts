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

    const width = getValidDimension(formData.get("coverWidth"));
    const height = getValidDimension(formData.get("coverHeight"));
    if (!width || !height) return;

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return {
      url: blob.url,
      width,
      height,
    };
  } catch (error) {
    console.error(`[Error] uploadImage ${(error as Error)?.message ?? error}`);
  }
}
