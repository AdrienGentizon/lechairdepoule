import { unstable_cache } from "next/cache";

import Trace from "@cdp/lib/trace";

import { getDateSpanUTC } from "../date";
import { CacheKey } from "../types";
import selectEvents from "./selectEvents";

async function getEvents() {
  const trace = new Trace("getCachedEvents");
  try {
    const events = await selectEvents({
      from: getDateSpanUTC().from.toISOString(),
    });
    trace.push(`${events.length}x event(s) selected`);
    trace.log();
    return events;
  } catch (error) {
    trace.pushError(error);
    trace.log(500);
    return [];
  }
}

const getCachedEvents = unstable_cache(getEvents, ["cachedEvents"], {
  tags: ["cachedEvents"] satisfies CacheKey[],
  revalidate: 43200,
});

export default getCachedEvents;
