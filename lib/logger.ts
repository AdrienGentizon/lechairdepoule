import { NextRequest } from "next/server";

export function logApiOperation(
  prefix: string,
  req: NextRequest,
  message: string = ""
) {
  console.log(`[API:${prefix}] ${req.url} ${message}`);
}

export function logApiError(prefix: string, req: NextRequest, error: unknown) {
  console.error(
    `[API-ERROR:${prefix}] ${req.url} (${(error as Error)?.message ?? "unknown error"})`
  );
  return `[API-ERROR:${prefix}] ${req.url} (${(error as Error)?.message ?? "unknown error"})`;
}
