import { NextRequest, NextResponse } from "next/server";

import { fetchEntryGraphQL } from "@/lib/contentful";
import { logApiError, logApiOperation } from "@/lib/logger";
import { TermsOfService } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    logApiOperation(req);

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

    if (!response?.data)
      return NextResponse.json(null, {
        status: 404,
      });

    return NextResponse.json<TermsOfService>(response?.data?.termsOfService, {
      status: 200,
    });
  } catch (error) {
    logApiError(req, error);

    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 }
    );
  }
}
