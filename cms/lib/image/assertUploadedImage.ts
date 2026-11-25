import "server-only";

import CustomError from "@cdp/lib/CustomError";
import { MAX_IMAGE_SIZE_IN_BYTES, isAllowedImageMime } from "@cdp/lib/file";

import {
  deleteObject,
  isOrganizationObjectKey,
  selectObjectMetadata,
} from "@/lib/s3";

export default async function assertUploadedImage(inputs: {
  objectKey: string;
  organizationId: string;
}) {
  if (
    !isOrganizationObjectKey({
      key: inputs.objectKey,
      organizationId: inputs.organizationId,
    })
  ) {
    throw new CustomError("unauthorized", {}, 403);
  }

  const metadata = await selectObjectMetadata({ key: inputs.objectKey });
  if (!metadata) throw new CustomError("not_found", {}, 404);

  if (!metadata.size || metadata.size > MAX_IMAGE_SIZE_IN_BYTES) {
    await deleteObject({ key: inputs.objectKey });
    throw new CustomError("file_too_large", {}, 400);
  }

  if (!isAllowedImageMime(metadata.contentType)) {
    await deleteObject({ key: inputs.objectKey });
    throw new CustomError("unsupported_file_type", {}, 400);
  }
}
