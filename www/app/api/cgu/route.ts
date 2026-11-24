import { NextRequest, NextResponse } from "next/server";

import Trace from "@cdp/lib/trace";

import { fetchEntryGraphQL } from "@/lib/contentful";
import { TermsOfService } from "@/lib/types";

export async function GET(req: NextRequest) {
  const trace = new Trace(req);
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
    }`,
    );

    if (!response?.data) {
      trace.pushError("not found");
      trace.log(404);
      return NextResponse.json(null, { status: 404 });
    }

    trace.log();
    return NextResponse.json<TermsOfService>(response?.data?.termsOfService, {
      status: 200,
    });
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500 });
  }
}
