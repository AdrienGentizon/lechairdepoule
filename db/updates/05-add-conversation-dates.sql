CREATE TABLE conversation_dates (
    conversation_id INTEGER PRIMARY KEY,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    CONSTRAINT conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
