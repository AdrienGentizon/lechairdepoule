import { fetchCollectionGraphQL } from "@/lib/contentful";

// type ExpectedDate =
//   `${number}-${number}-${number}T${number}:${number}:${number}Z`;

export type Event = {
  sys: { id: string };
  title: string;
  shortDescription?: string;
  message: string;
  date: Date;
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

export default async function getEvents() {
  return (
    (
      await fetchCollectionGraphQL<Event>(
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
    .map((event) => {
      return {
        ...event,
        date: new Date(new Date(event.date).toUTCString()),
      };
    })
    .sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    });
}
