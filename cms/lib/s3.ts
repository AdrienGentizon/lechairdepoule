import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import "server-only";

import env from "@/lib/env";

const UPLOAD_URL_EXPIRES_IN_SECONDS = 300;
const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 3600;

const s3 = new S3Client({
  endpoint: env().S3_ENDPOINT,
  region: env().S3_REGION,
  credentials: {
    accessKeyId: env().S3_ACCESS_KEY_ID,
    secretAccessKey: env().S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

function toUserObjectKeyPrefix(userId: string) {
  return `files/${userId}/`;
}

export function toObjectKey(userId: string) {
  return `${toUserObjectKeyPrefix(userId)}${crypto.randomUUID()}`;
}

export function isUserObjectKey(inputs: { key: string; userId: string }) {
  return inputs.key.startsWith(toUserObjectKeyPrefix(inputs.userId));
}

function toOrganizationObjectKeyPrefix(organizationId: string) {
  return `organizations/${organizationId}/`;
}

export function toOrganizationObjectKey(organizationId: string) {
  return `${toOrganizationObjectKeyPrefix(organizationId)}${crypto.randomUUID()}`;
}

export function isOrganizationObjectKey(inputs: {
  key: string;
  organizationId: string;
}) {
  return inputs.key.startsWith(
    toOrganizationObjectKeyPrefix(inputs.organizationId),
  );
}

export function toPublicUrl(key: string) {
  return `${env().S3_PUBLIC_URL}/${key}`;
}

export async function signUploadUrl(inputs: {
  key: string;
  contentType: string;
  size?: number;
}) {
  return await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env().S3_BUCKET,
      Key: inputs.key,
      ContentType: inputs.contentType,
      ContentLength: inputs.size,
    }),
    { expiresIn: UPLOAD_URL_EXPIRES_IN_SECONDS },
  );
}

function toAttachmentContentDisposition(name: string) {
  return `attachment; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function signDownloadUrl(inputs: { key: string; name: string }) {
  return await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env().S3_BUCKET,
      Key: inputs.key,
      ResponseContentDisposition: toAttachmentContentDisposition(inputs.name),
    }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS },
  );
}

export async function selectObjectMetadata(inputs: { key: string }) {
  try {
    const object = await s3.send(
      new HeadObjectCommand({ Bucket: env().S3_BUCKET, Key: inputs.key }),
    );
    return { size: object.ContentLength, contentType: object.ContentType };
  } catch (error) {
    if (error instanceof NotFound) return;
    throw error;
  }
}

export async function deleteObject(inputs: { key: string }) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: env().S3_BUCKET, Key: inputs.key }),
  );
}
