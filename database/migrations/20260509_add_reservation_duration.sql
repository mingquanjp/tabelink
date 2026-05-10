BEGIN;

ALTER TABLE reservation
    ADD COLUMN IF NOT EXISTS durationminutes INT NOT NULL DEFAULT 120;

ALTER TABLE reservation
    DROP CONSTRAINT IF EXISTS reservation_durationminutes_check;

ALTER TABLE reservation
    ADD CONSTRAINT reservation_durationminutes_check
    CHECK (durationminutes > 0);

CREATE INDEX IF NOT EXISTS idx_reservation_table_time
    ON reservation(restaurantid, tableid, reservationdatetime);

COMMIT;
