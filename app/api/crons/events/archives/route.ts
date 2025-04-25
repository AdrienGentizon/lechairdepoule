import { fetchCollectionGraphQL } from "@/lib/contentful";
import sql from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log(`[API]`, req.nextUrl.pathname);

    const date = new Date();
    date.setUTCMonth((12 + (date.getUTCMonth() - 1)) % 12);
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    date.setUTCDate(0);

    console.log((await sql<{ one: 1 | null }[]>`SELECT 1 as "one";`).at(0));

    const events = await fetchCollectionGraphQL<{ title: string }>(
      "eventCollection",
      `query {
    eventCollection(where: {date_lte : "${date.toISOString()}"}) {
      items {
        sys {
            id
          }
        title
        shortDescription
        message
        date
        invitationOnly
        soldOut
        atPeinePerdue
        picture {
        sys {
          id
          }
        url
        width
        height
        }
      }
    }
  }`,
    );

    (events?.data?.eventCollection.items ?? []).forEach((event) => {
      console.log(event?.title);
    });

    return NextResponse.json({ date }, { status: 200 });
  } catch (error) {
    console.error("[Error]", req.nextUrl.pathname, error);
    return NextResponse.json(null, { status: 500 });
  }
}
