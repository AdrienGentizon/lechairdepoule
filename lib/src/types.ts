export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Dictionaries<T> = Record<Locale, T>;

export type AuthErrorKeys =
  "INVALID_OTP" | "OTP_EXPIRED" | "TOO_MANY_ATTEMPTS" | "UNKNOWN_AUTH_ERROR";

export type ErrorKeys =
  | "server_error"
  | "bad_request"
  | "not_found"
  | "unauthorized"
  | "upsert_user_failed"
  | "email_not_sent"
  | AuthErrorKeys;

export type Result<T = unknown> =
  { success: true; data: T } | { success: false; error: ErrorKeys };
