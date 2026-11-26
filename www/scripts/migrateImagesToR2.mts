import postgres from "postgres";

import { putObject } from "@cdp/lib/s3";

const PAUSE_BETWEEN_UPLOADS_IN_MS = 500;

const pgConnectionString = process.env.PG_CONNECTION_STRING;
if (!pgConnectionString) throw new Error("PG_CONNECTION_STRING is required.");

const sql = postgres(pgConnectionString, { transform: postgres.camel });

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateImage(image: {
  source: "events" | "conversations";
  id: string;
  imageUrl: string;
}): Promise<
  { success: true; data: { key: string } } | { success: false; error: string }
> {
  try {
    const response = await fetch(image.imageUrl);
    if (!response.ok)
      return { success: false, error: `fetch failed ${response.status}` };

    const key = `legacy/${image.source}/${image.id}`;
    await putObject({
      key,
      body: new Uint8Array(await response.arrayBuffer()),
      contentType:
        response.headers.get("content-type") ?? "application/octet-stream",
    });

    await sql`
      UPDATE ${sql(image.source)}
      SET image_key = ${key}
      WHERE id = ${image.id} AND image_key IS NULL;`;

    return { success: true, data: { key } };
  } catch (error) {
    return { success: false, error: `${(error as Error)?.message ?? error}` };
  }
}

const imagesToMigrate = await sql<
  { source: "events" | "conversations"; id: string; imageUrl: string }[]
>`
  SELECT 'events' AS source, id::text, image_url
  FROM events
  WHERE image_url IS NOT NULL AND image_key IS NULL
  UNION ALL
  SELECT 'conversations' AS source, id::text, image_url
  FROM conversations
  WHERE image_url IS NOT NULL AND image_key IS NULL
  ORDER BY source, id;`;

console.log(`${imagesToMigrate.length} images to migrate`);

let failedCount = 0;

for (const image of imagesToMigrate) {
  const result = await migrateImage(image);
  if (result.success) {
    console.log(`ok     ${image.source}/${image.id} -> ${result.data.key}`);
  } else {
    failedCount++;
    console.error(`failed ${image.source}/${image.id} ${result.error}`);
  }
  await wait(PAUSE_BETWEEN_UPLOADS_IN_MS);
}

console.log(
  `done: ${imagesToMigrate.length - failedCount} migrated, ${failedCount} failed`,
);

await sql.end();
