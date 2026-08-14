BEGIN;

CREATE TABLE events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    image_width INTEGER,
    image_height INTEGER,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    timezone TEXT NOT NULL,
    price TEXT,
    venue TEXT,
    url TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    conversation_id INTEGER,
    CONSTRAINT user_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE RESTRICT,
    CONSTRAINT conversation_uq UNIQUE(conversation_id)
);

-- default kept (not dropped): prod still inserts/upserts event_metadata without a timezone
ALTER TABLE event_metadata ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Europe/Paris';

-- default kept: prod inserts conversations without setting updated_at
ALTER TABLE conversations ADD COLUMN updated_at TIMESTAMPTZ;
UPDATE conversations SET updated_at = created_at WHERE updated_at IS NULL;
ALTER TABLE conversations ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE conversations ALTER COLUMN updated_at SET NOT NULL;

INSERT INTO events (
    title, description, image_url, image_width, image_height,
    starts_at, ends_at, timezone, price, venue, url,
    created_by, created_at, updated_at, deleted_at, conversation_id, type
)
SELECT
    c.title, c.description, c.image_url, c.image_width, c.image_height,
    em.starts_at, em.ends_at, em.timezone, em.price, em.venue, em.url,
    c.created_by, c.created_at, c.created_at, c.deleted_at, c.id, c.type
FROM conversations c
JOIN event_metadata em ON em.conversation_id = c.id
WHERE c.type IN ('EVENT', 'RELEASE')
  AND em.starts_at IS NOT NULL;

UPDATE conversations SET type = 'TOPIC' WHERE type IS NULL;
ALTER TABLE conversations ALTER COLUMN type SET DEFAULT 'TOPIC';
ALTER TABLE conversations ALTER COLUMN type SET NOT NULL;

COMMIT;
