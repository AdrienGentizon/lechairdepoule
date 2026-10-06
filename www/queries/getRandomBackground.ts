import { fetchEntryGraphQL } from "@/lib/contentful";

export type ContactPage = {
  sys: { id: string };
  assetsCollection: {
    items: {
      sys: {
        id: string;
      };
      url: string;
      width: number;
      height: number;
    }[];
  };
};

export default async function getRandomBackground() {
  return (
    await fetchEntryGraphQL<ContactPage>(
      "randomBackground",
      `query {
      randomBackground(id: "5pV7ESpyTXWpqezaubJgZr") {
      sys {
        id
        }
      assetsCollection {
        items{
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
  )?.data?.randomBackground;
}
