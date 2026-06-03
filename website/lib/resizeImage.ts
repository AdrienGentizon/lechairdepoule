import imageCompression from "browser-image-compression";

export async function resizeImage(
  file: File
): Promise<{ file: File; width: number; height: number } | undefined> {
  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 568,
      fileType: "image/webp",
      initialQuality: 0.75,
      useWebWorker: true,
    });

    const bitmap = await createImageBitmap(compressed);
    const { width, height } = bitmap;
    bitmap.close();

    return { file: compressed, width, height };
  } catch {
    return undefined;
  }
}
