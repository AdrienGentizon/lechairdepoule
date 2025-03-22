import { fetchGraphQL } from "@/lib/contentful";

export type Item = {
  sys: { id: string };
  name: string;
  price: number;
  description?: string;
  soldOut?: boolean;
  picturesCollection: {
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

export default async function getItems() {
  return (
    (
      await fetchGraphQL<Item>(
        "itemCollection",
        `query {
      itemCollection {
            items {
              sys {
                  id
                }
              name
              price
              description
              soldOut
              picturesCollection {
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
          }
        }`,
      )
    )?.data?.itemCollection.items ?? []
  );
}
