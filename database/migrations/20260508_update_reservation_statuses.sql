BEGIN;

-- Align reservation lifecycle with Reference screen ID12:
-- Pending -> Confirmed -> Arrived -> Completed, with Cancelled as terminal cancel state.
-- Legacy values from the initial schema are normalized before tightening the CHECK.
UPDATE reservation
SET status = CASE status
    WHEN 'Approved' THEN 'Confirmed'
    WHEN 'Rejected' THEN 'Cancelled'
    WHEN 'NoShow' THEN 'Cancelled'
    ELSE status
END
WHERE status IN ('Approved', 'Rejected', 'NoShow');

DROP INDEX IF EXISTS ux_reservation_table_timeslot_active;

ALTER TABLE reservation
    DROP CONSTRAINT IF EXISTS reservation_status_check;

ALTER TABLE reservation
    ADD CONSTRAINT reservation_status_check
    CHECK (status IN ('Pending', 'Confirmed', 'Arrived', 'Completed', 'Cancelled'));

CREATE UNIQUE INDEX ux_reservation_table_timeslot_active
    ON reservation(restaurantid, tableid, reservationdatetime)
    WHERE tableid IS NOT NULL AND status IN ('Pending', 'Confirmed', 'Arrived');

-- Screen ID12 table status menu only includes Empty/Using/Reserved.
UPDATE restaurant_table
SET status = 'Empty'
WHERE status = 'OutOfService';

ALTER TABLE restaurant_table
    DROP CONSTRAINT IF EXISTS restaurant_table_status_check;

ALTER TABLE restaurant_table
    ADD CONSTRAINT restaurant_table_status_check
    CHECK (status IN ('Empty', 'Using', 'Reserved'));

COMMIT;
