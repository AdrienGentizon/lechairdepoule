BEGIN;

ALTER TABLE conversations ADD COLUMN image_key TEXT;

COMMIT;
