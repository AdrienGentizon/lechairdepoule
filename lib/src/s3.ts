import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const UPLOAD_URL_EXPIRES_IN_SECONDS = 300;
const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 3600;

function getEnvVar(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`[Error] getEnvVar: ${key} is required.`);
  return value;
}

const S3_BUCKET = getEnvVar("S3_BUCKET");
const S3_PUBLIC_URL = getEnvVar("S3_PUBLIC_URL");

const s3 = new S3Client({
  endpoint: getEnvVar("S3_ENDPOINT"),
  region: getEnvVar("S3_REGION"),
  credentials: {
    accessKeyId: getEnvVar("S3_ACCESS_KEY_ID"),
    secretAccessKey: getEnvVar("S3_SECRET_ACCESS_KEY"),
  },
  forcePathStyle: true,
});

export function toUserObjectKeyPrefix(userId: string) {
  return `files/${userId}/`;
}

export function toUserObjectKey(userId: string) {
  return `${toUserObjectKeyPrefix(userId)}${crypto.randomUUID()}`;
}

export function toOrganizationObjectKeyPrefix(organizationId: string) {
  return `organizations/${organizationId}/`;
}

export function toOrganizationObjectKey(organizationId: string) {
  return `${toOrganizationObjectKeyPrefix(organizationId)}${crypto.randomUUID()}`;
}

export function toPublicUrl(key: string) {
  return `${S3_PUBLIC_URL}/${key}`;
}

export async function signUploadUrl(inputs: {
  key: string;
  contentType: string;
  size?: number;
}) {
  return await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
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
      Bucket: S3_BUCKET,
      Key: inputs.key,
      ResponseContentDisposition: toAttachmentContentDisposition(inputs.name),
    }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS },
  );
}

export async function selectObjectMetadata(inputs: { key: string }) {
  try {
    const object = await s3.send(
      new HeadObjectCommand({ Bucket: S3_BUCKET, Key: inputs.key }),
    );
    return { size: object.ContentLength, contentType: object.ContentType };
  } catch (error) {
    if (error instanceof NotFound) return;
    throw error;
  }
}

export async function deleteObject(inputs: { key: string }) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: inputs.key }),
  );
}
