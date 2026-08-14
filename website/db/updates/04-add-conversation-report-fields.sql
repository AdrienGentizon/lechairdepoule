ALTER TABLE conversations ADD COLUMN reported_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN reported_by INTEGER;
ALTER TABLE conversations ADD CONSTRAINT reported_by_fk FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL;
