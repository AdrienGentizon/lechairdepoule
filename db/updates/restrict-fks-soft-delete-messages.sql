ALTER TABLE conversations DROP CONSTRAINT user_fk;
ALTER TABLE conversations ADD CONSTRAINT user_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE messages DROP CONSTRAINT user_fk;
ALTER TABLE messages ADD CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE messages DROP CONSTRAINT conversation_fk;
ALTER TABLE messages ADD CONSTRAINT conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE RESTRICT;

ALTER TABLE messages DROP CONSTRAINT parent_message_fk;
ALTER TABLE messages ADD CONSTRAINT parent_message_fk FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE RESTRICT;

ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN deleted_by INTEGER;
ALTER TABLE messages ADD CONSTRAINT deleted_by_fk FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL;
