import { fetchGraphQL } from "@/lib/contentful";

// type ExpectedDate =
//   `${number}-${number}-${number}T${number}:${number}:${number}Z`;

export type Event = {
  sys: { id: string };

  title: string;
  shortDescription?: string;
  message: string;
  date: string;
  picture: {
    sys: {
      id: string;
    };
    url: string;
    width: number;
    height: number;
  } | null;
};

export default async function getEvents() {
  const date = new Date();
  const monthFirstDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthLastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const seeOneMoreMonth = true;
  if (seeOneMoreMonth) {
    monthLastDate.setMonth(monthLastDate.getMonth() + 1);
  }

  return (
    (
      await fetchGraphQL<Event>(
        "eventCollection",
        `query {
    eventCollection(where: {date_gte: "${monthFirstDate.toISOString()}", date_lte : "${monthLastDate.toISOString()}"} ,order: date_DESC) {
      items {
        sys {
            id
          }
        title
        shortDescription
        message
        date
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
      )
    )?.data?.eventCollection.items ?? []
  );
}
