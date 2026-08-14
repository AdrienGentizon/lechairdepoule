BEGIN;

-- run only after the app deploy that stops writing to event_metadata /
-- creating conversations with type EVENT or RELEASE

UPDATE conversations
SET deleted_at = now()
WHERE type IN ('EVENT', 'RELEASE') AND deleted_at IS NULL;

ALTER TABLE conversations DROP COLUMN closed_to_contributions_at;
ALTER TABLE conversations ALTER COLUMN updated_at DROP DEFAULT;

DROP TABLE event_metadata;

COMMIT;
