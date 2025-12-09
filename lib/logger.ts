import { NextRequest } from "next/server";

export function logApiOperation(req: NextRequest, message?: string) {
  console.log(`[Operation] ${req.url}${message ? ` ${message}` : ""}`);
}

export function logApiError(req: NextRequest, error: unknown) {
  const message =
    (error as Error)?.message ??
    (typeof error === "string" && error) ??
    "unknown error";
  console.error(`[Error] ${req.url} ${message}`);
  return `[Error] ${req.url} ${message}`;
}
