import { fetchEntryGraphQL } from "@/lib/contentful";
import { TermsOfService } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const opertationName = `${req.method} ${req.url}`;
  try {
    console.log(`[Operation]`, opertationName);

    const response = await fetchEntryGraphQL<TermsOfService>(
      "termsOfService",
      `query {
      termsOfService(id: "1E0kx1tfqDqlgkyRS3H0to") {
      sys {
        id
        }
      cgu
      }
    }`,
    );

    if (!response?.data)
      return NextResponse.json(null, {
        status: 404,
      });

    return NextResponse.json<TermsOfService>(response?.data?.termsOfService, {
      status: 200,
    });
  } catch (error) {
    console.error(
      `[Operation]`,
      opertationName,
      (error as Error)?.message ?? error,
    );
    return NextResponse.json(
      {
        error: "server error",
      },
      { status: 500 },
    );
  }
}
