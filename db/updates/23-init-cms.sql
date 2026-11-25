BEGIN;

CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    managed_by INTEGER NOT NULL,
    type TEXT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    image_width INTEGER,
    image_height INTEGER,
    country TEXT NOT NULL,
    zipcode TEXT NOT NULL,
    city TEXT NOT NULL,
    street TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT user_fk FOREIGN KEY (managed_by) REFERENCES users(id) ON DELETE RESTRICT
);

ALTER TABLE events
    ADD COLUMN organization_id INTEGER,
    ADD COLUMN venue_id INTEGER,
    ADD COLUMN published_at TIMESTAMPTZ,
    ADD COLUMN visibility TEXT NOT NULL DEFAULT 'PUBLIC',
    ADD COLUMN image_key TEXT,
    ADD CONSTRAINT organization_fk FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
    ADD CONSTRAINT venue_fk FOREIGN KEY (venue_id) REFERENCES organizations(id) ON DELETE SET NULL;

COMMIT;
