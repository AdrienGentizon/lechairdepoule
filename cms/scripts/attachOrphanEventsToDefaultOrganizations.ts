import postgres from "postgres";

const BACKFILL_SOURCE = "www-backfill";

const connectionString = process.env.PG_CONNECTION_STRING;
if (!connectionString) throw new Error("PG_CONNECTION_STRING is required");

const sql = postgres(connectionString, { transform: postgres.camel });

const organizations = await sql<{ id: string; managedBy: string }[]>`
  SELECT
    id::text,
    managed_by::text
  FROM organizations
  WHERE
    metadata->>'source' = ${BACKFILL_SOURCE};`;

console.log(`${organizations.length} default organizations`);

for (const { id, managedBy } of organizations) {
  const { count } = await sql`
    UPDATE events
    SET
      organization_id = ${id}::int
    WHERE
      organization_id IS NULL
      AND created_by = ${managedBy}::int;`;

  console.log(`organization ${id} <- ${count} events`);
}

await sql.end();
