import { ContentfulClientApi, createClient } from "contentful";

import getEnv from "./env";

let client: undefined | ContentfulClientApi<undefined> = undefined;

export default function contentful() {
  if (!client) {
    client = createClient({
      space: getEnv().CONTENTFUL_SPACE_ID,
      environment: getEnv().CONTENTFUL_ENVIRONMENT,
      accessToken: getEnv().CONTENTFUL_DELIVERY_API_KEY,
    });
  }
  return client;
}
