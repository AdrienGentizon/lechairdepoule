BEGIN;

ALTER TABLE events
    ADD COLUMN start_date DATE,
    ADD COLUMN start_time TIME,
    ADD COLUMN end_date DATE,
    ADD COLUMN end_time TIME;

UPDATE events SET
    start_date = (starts_at AT TIME ZONE timezone)::date,
    start_time = (starts_at AT TIME ZONE timezone)::time,
    end_date = (ends_at AT TIME ZONE timezone)::date,
    end_time = (ends_at AT TIME ZONE timezone)::time;

COMMIT;
