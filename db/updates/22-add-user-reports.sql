BEGIN;

CREATE TABLE user_reports (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('BUG', 'QUESTION', 'FEATURE')),
    body TEXT NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    reviewed_at TIMESTAMPTZ,
    CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

COMMIT;
