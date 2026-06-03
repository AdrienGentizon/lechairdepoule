import { NextRequest, NextResponse } from "next/server";

import { fetchEntryGraphQL } from "@/lib/contentful";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { TermsOfService } from "@/lib/types";

export async function GET(req: NextRequest) {
  const logger = getRequestLogger(req);
  try {
    const response = await fetchEntryGraphQL<TermsOfService>(
      "termsOfService",
      `query {
      termsOfService(id: "1E0kx1tfqDqlgkyRS3H0to") {
      sys {
        id
        }
      cgu
      }
    }`
    );

    if (!response?.data) {
      logger.withError(new Error("not found")).flush();
      return NextResponse.json(null, { status: 404 });
    }

    logger.flush();
    return NextResponse.json<TermsOfService>(response?.data?.termsOfService, {
      status: 200,
    });
  } catch (error) {
    logger.withError(error).flush();
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
