export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Dictionaries<T> = Record<Locale, T>;

export type AuthErrorKeys =
  "INVALID_OTP" | "OTP_EXPIRED" | "TOO_MANY_ATTEMPTS" | "UNKNOWN_AUTH_ERROR";

export type ErrorKeys =
  | "unknown_error"
  | "server_error"
  | "bad_request"
  | "not_found"
  | "unauthorized"
  | "upsert_user_failed"
  | "email_not_sent"
  | "file_too_large"
  | "unsupported_file_type"
  | "upload_failed"
  | "pseudo_taken"
  | AuthErrorKeys;

export type Result<T = unknown> =
  { success: true; data: T } | { success: false; error: ErrorKeys };

export type ImageUploadUrl = {
  objectKey: string;
  url: string;
};

export type User = {
  id: string;
  pseudo: string | null;
  role: string | null;
  createdAt: string;
  bannedAt: string | null;
  deletedAt: string | null;
  tosAcceptedAt: string | null;
};

export type Event = {
  id: string;
  type: "EVENT" | "RELEASE";
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
  price: string | null;
  venue: string | null;
  url: string | null;
  visibility: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type UserReport = {
  id: string;
  userId: string;
  type: "BUG" | "QUESTION" | "FEATURE";
  body: string;
  pageUrl: string | null;
  userAgent: string | null;
  createdAt: string;
  reviewedAt: string | null;
};
