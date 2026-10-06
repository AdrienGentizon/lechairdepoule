BEGIN;

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

COMMIT;
