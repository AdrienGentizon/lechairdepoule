import { ContentfulClientApi, createClient } from "contentful";

import env from "./env";

let client: undefined | ContentfulClientApi<undefined> = undefined;

export default function contentful() {
  if (!client) {
    client = createClient({
      space: env().CONTENTFUL_SPACE_ID,
      environment: env().CONTENTFUL_ENVIRONMENT,
      accessToken: env().CONTENTFUL_DELIVERY_API_KEY,
    });
  }
  return client;
}

export type EntryTag = "contact" | "randomBackground";
export type CollectionTag = "eventCollection" | "itemCollection";

type CollectionData<K extends CollectionTag, T = unknown> = {
  data?: Record<
    K,
    {
      items: T[];
    }
  >;
};

type EntryData<K extends EntryTag, T = unknown> = {
  data?: Record<K, T>;
};

export async function fetchCollectionGraphQL<T>(
  tag: CollectionTag,
  query: string,
) {
  try {
    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${env().CONTENTFUL_DELIVERY_API_KEY}`,
        },
        body: JSON.stringify({ query }),
        next: { tags: [tag] },
      },
    );
    return response.json() as Promise<CollectionData<typeof tag, T>>;
  } catch (error) {
    console.error(
      "[ERROR:CONTENTFUL]",
      (error as Error)?.message ?? "unknown error",
    );
    return undefined;
  }
}

export async function fetchEntryGraphQL<T>(tag: EntryTag, query: string) {
  try {
    const response = await fetch(
      `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${env().CONTENTFUL_DELIVERY_API_KEY}`,
        },
        body: JSON.stringify({ query }),
        next: { tags: [tag] },
      },
    );
    return response.json() as Promise<EntryData<typeof tag, T>>;
  } catch (error) {
    console.error(
      "[ERROR:CONTENTFUL]",
      (error as Error)?.message ?? "unknown error",
    );
    return undefined;
  }
}
