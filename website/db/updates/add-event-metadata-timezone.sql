BEGIN;

ALTER TABLE event_metadata ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Europe/Paris';
ALTER TABLE event_metadata ALTER COLUMN timezone DROP DEFAULT;

COMMIT;
