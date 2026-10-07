export type ErrorKeys =
  | "server_error"
  | "unauthorized"
  | "bad_request"
  | "not_found"
  | "invalid_otp"
  | "expired_otp";

export type Result<T = unknown> =
  { success: true; data: T } | { success: false; error: ErrorKeys };
