import { unstable_cache } from "next/cache";

import { getDateSpanUTC } from "../date";
import { getLogger } from "../logger";
import { CacheKey } from "../types";
import selectEvents from "./selectEvents";

async function getEvents() {
  const logger = getLogger("getCachedEvents");
  try {
    const events = await selectEvents({
      from: getDateSpanUTC().from.toISOString(),
    });
    logger.append(`${events.length}x event(s) selected`);
    logger.flush();
    return events;
  } catch (error) {
    logger.withError(error).flush();
    return [];
  }
}

const getCachedEvents = unstable_cache(getEvents, ["cachedEvents"], {
  tags: ["cachedEvents"] satisfies CacheKey[],
  revalidate: 43200,
});

export default getCachedEvents;
