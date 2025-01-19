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
