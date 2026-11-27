BEGIN;

UPDATE events SET published_at = created_at WHERE published_at IS NULL;

ALTER TABLE events
    ALTER COLUMN organization_id SET NOT NULL,
    ALTER COLUMN published_at SET NOT NULL;

COMMIT;
