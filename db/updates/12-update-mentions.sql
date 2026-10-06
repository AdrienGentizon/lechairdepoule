ALTER TABLE mentions RENAME TO notifications;
ALTER TABLE notifications RENAME CONSTRAINT mention_uq TO notification_uq;
ALTER TABLE notifications ADD COLUMN type TEXT NOT NULL DEFAULT 'mention';

ALTER INDEX idx_mentions_user_id RENAME TO idx_notifications_user_id;
ALTER INDEX idx_mentions_unread RENAME TO idx_notifications_unread;
