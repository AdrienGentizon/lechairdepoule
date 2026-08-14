import { fetchCollectionGraphQL } from "@/lib/contentful";
import { DANGEROUS_FALLBACK_TZ } from "@/lib/date";
import { ContentfulEvent } from "@/lib/types";

// type ExpectedDate =
//   `${number}-${number}-${number}T${number}:${number}:${number}Z`;

const DANGEROUS_FALLBACK_CREATED_BY = {
  id: "n/a",
  pseudo: "La Patronne",
};

type RawEvent = {
  sys: { id: string };
  title: string;
  shortDescription?: string;
  message: string;
  date: string;
  invitationOnly?: boolean;
  soldOut?: boolean;
  atPeinePerdue?: boolean;
  picture: {
    sys: {
      id: string;
    };
    url: string;
    width: number;
    height: number;
  } | null;
};

function toEvent(raw: RawEvent) {
  return {
    id: raw.sys.id,
    title: raw.title,
    shortDescription: raw.shortDescription ?? null,
    description: raw.message,
    type: "EVENT",
    atPeinePerdue: raw.atPeinePerdue ?? false,
    coverUrl: raw.picture?.url ?? null,
    coverWidth: raw.picture?.width ?? null,
    coverHeight: raw.picture?.height ?? null,
    startsAt: raw.date,
    endsAt: null,
    timezone: DANGEROUS_FALLBACK_TZ,
    price: null,
    venue: null,
    url: null,
    createdBy: DANGEROUS_FALLBACK_CREATED_BY,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } satisfies ContentfulEvent;
}

function getStartingDate() {
  const queryExecutionDate = new Date();

  queryExecutionDate.setUTCHours(0);
  queryExecutionDate.setUTCMinutes(0);
  queryExecutionDate.setUTCSeconds(0);
  queryExecutionDate.setUTCMilliseconds(0);

  const showCurrentWeek = false;
  if (showCurrentWeek) {
    const days = [1, 2, 3, 4, 5, 6, 0];
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return new Date(
      queryExecutionDate.getTime() -
        days.indexOf(queryExecutionDate.getDay()) * oneDayInMs
    );
  }
  return new Date(queryExecutionDate.getTime() - 2 * 60 * 60 * 1000);
}

function getEndingDate() {
  const queryExecutionDate = new Date();

  const monthLastDate = new Date(
    queryExecutionDate.getFullYear(),
    queryExecutionDate.getMonth() + 2,
    0
  );

  const seeOneMoreMonth = true;
  if (seeOneMoreMonth) {
    monthLastDate.setMonth(monthLastDate.getMonth() + 1);
  }

  return monthLastDate;
}

export default async function getContentfulEvents() {
  return (
    (
      await fetchCollectionGraphQL<RawEvent>(
        "eventCollection",
        `query {
    eventCollection(where: {date_gte: "${getStartingDate().toISOString()}", date_lte : "${getEndingDate().toISOString()}"} ,order: date_DESC) {
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
  }`
      )
    )?.data?.eventCollection.items ?? []
  )
    .map(toEvent)
    .sort((a, b) => {
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });
}
