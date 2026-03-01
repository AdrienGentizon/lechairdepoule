import { NextRequest } from "next/server";

import { getLogger } from "./logger";

export function getRequestLogger(req: NextRequest) {
  return getLogger(`${req.method} ${req.url}`, "Request");
}
