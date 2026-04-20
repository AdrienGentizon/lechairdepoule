CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    pseudo TEXT UNIQUE,
    created_at TIMESTAMPTZ,
    banned_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    tos_accepted_at TIMESTAMPTZ,
    banned_by INTEGER,
    role TEXT,
    auth_id TEXT UNIQUE NOT NULL,
    auth_provider TEXT NOT NULL,
    CONSTRAINT banned_by_fk FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE conversations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    image_width INTEGER,
    image_height INTEGER,
		created_by INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ,
    type TEXT,
    CONSTRAINT user_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE conversation_dates (
    conversation_id INTEGER PRIMARY KEY,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    CONSTRAINT conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ,
    reported_by INTEGER,
    deleted_at TIMESTAMPTZ,
    deleted_by INTEGER,
    user_id INTEGER NOT NULL,
    conversation_id INTEGER,
    parent_message_id INTEGER,
    CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT reported_by_fk FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT deleted_by_fk FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE RESTRICT,
    CONSTRAINT parent_message_fk FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE RESTRICT
);

CREATE TABLE notifications (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'mention'
  CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  CONSTRAINT mention_uq UNIQUE(message_id, user_id)
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX trgm_idx_gist ON users USING GIST (pseudo gist_trgm_ops);
-- SET pg_trgm.similarity_threshold = 0.3;
