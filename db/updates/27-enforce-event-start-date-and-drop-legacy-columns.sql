BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM events WHERE image_url IS NOT NULL AND image_key IS NULL) THEN
        RAISE EXCEPTION 'events with image_url not migrated to image_key';
    END IF;
END $$;

ALTER TABLE events
    ALTER COLUMN start_date SET NOT NULL,
    DROP COLUMN starts_at,
    DROP COLUMN ends_at,
    DROP COLUMN image_url;

COMMIT;
