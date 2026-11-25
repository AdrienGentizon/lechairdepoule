import CustomError from "@cdp/lib/CustomError";

import resizeImage from "@/lib/image/resizeImage";
import { ImageUploadUrl } from "@/lib/types";

export default async function uploadImage(organizationId: string, file: File) {
  const resizedImage = await resizeImage(file);
  if (!resizedImage.success) throw new CustomError(resizedImage.error, {}, 400);

  const uploadUrlResponse = await fetch(
    `/api/organizations/${organizationId}/images/upload-url`,
    {
      method: "POST",
      body: JSON.stringify({
        contentType: resizedImage.data.file.type,
        size: resizedImage.data.file.size,
      }),
    },
  );
  if (!uploadUrlResponse.ok)
    throw await CustomError.fromResponse(uploadUrlResponse);
  const { objectKey, url } = (await uploadUrlResponse.json()) as ImageUploadUrl;

  const uploadResponse = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": resizedImage.data.file.type },
    body: resizedImage.data.file,
  });
  if (!uploadResponse.ok)
    throw new CustomError("upload_failed", {}, uploadResponse.status);

  return {
    objectKey,
    width: resizedImage.data.width,
    height: resizedImage.data.height,
  };
}
