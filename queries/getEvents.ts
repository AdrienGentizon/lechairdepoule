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
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  const showCurrentWeek = false;
  if (showCurrentWeek) {
    const days = [1, 2, 3, 4, 5, 6, 0];
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return new Date(date.getTime() - days.indexOf(date.getDay()) * oneDayInMs);
  }
  return date;
}

export default async function getEvents() {
  const date = new Date();
  const lastMonday = getStartingDate();
  const monthLastDate = new Date(date.getFullYear(), date.getMonth() + 2, 0);
  const seeOneMoreMonth = true;
  if (seeOneMoreMonth) {
    monthLastDate.setMonth(monthLastDate.getMonth() + 1);
  }

  return (
    (
      await fetchCollectionGraphQL<Event>(
        "eventCollection",
        `query {
    eventCollection(where: {date_gte: "${lastMonday.toISOString()}", date_lte : "${monthLastDate.toISOString()}"} ,order: date_DESC) {
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
        60 * 60,
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
