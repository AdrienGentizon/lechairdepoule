CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    pseudo TEXT,
    created_at TIMESTAMP,
    banned_at TIMESTAMP,
    deleted_at TIMESTAMP,
    banned_by INTEGER,
    role TEXT,
    auth_id TEXT UNIQUE NOT NULL,
    auth_provider TEXT NOT NULL,
    CONSTRAINT banned_by_fk FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE conversations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
		created_by INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT user_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ,
		reported_by INTEGER,
		user_id INTEGER NOT NULL,
		conversation_id INTEGER,
    CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT reported_by_fk FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
