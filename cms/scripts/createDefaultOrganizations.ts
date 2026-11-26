import postgres from "postgres";

const DEFAULT_ORGANIZATION_NAME = "Mon orga";
const PLACEHOLDER_COUNTRY = "FR";
const PLACEHOLDER_ZIPCODE = "";
const PLACEHOLDER_CITY = "";
const BACKFILL_SOURCE = "www-backfill";

const connectionString = process.env.PG_CONNECTION_STRING;
if (!connectionString) throw new Error("PG_CONNECTION_STRING is required");

const sql = postgres(connectionString, { transform: postgres.camel });

const users = await sql<{ createdBy: string }[]>`
  SELECT DISTINCT
    e.created_by::text
  FROM events e
  WHERE
    e.organization_id IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM organizations o
      WHERE
        o.managed_by = e.created_by
        AND o.metadata->>'source' = ${BACKFILL_SOURCE}
    );`;

console.log(`${users.length} users without default organization`);

for (const { createdBy } of users) {
  const [organization] = await sql<{ id: string }[]>`
    INSERT INTO
      organizations (managed_by, type, name, country, zipcode, city, metadata, created_at, updated_at)
    VALUES
      (
        ${createdBy}::int,
        NULL,
        ${DEFAULT_ORGANIZATION_NAME},
        ${PLACEHOLDER_COUNTRY},
        ${PLACEHOLDER_ZIPCODE},
        ${PLACEHOLDER_CITY},
        jsonb_build_object('source', ${BACKFILL_SOURCE}::text),
        NOW(),
        NOW()
      )
    RETURNING
      id::text;`;

  console.log(`user ${createdBy} -> organization ${organization.id}`);
}

await sql.end();
