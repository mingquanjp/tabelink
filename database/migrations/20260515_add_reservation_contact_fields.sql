BEGIN;

ALTER TABLE reservation
    ADD COLUMN IF NOT EXISTS customername VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phonenumber VARCHAR(50);

ALTER TABLE reservation
    DROP CONSTRAINT IF EXISTS reservation_customername_not_blank,
    DROP CONSTRAINT IF EXISTS reservation_phonenumber_not_blank;

ALTER TABLE reservation
    ADD CONSTRAINT reservation_customername_not_blank
    CHECK (customername IS NULL OR BTRIM(customername) <> ''),
    ADD CONSTRAINT reservation_phonenumber_not_blank
    CHECK (phonenumber IS NULL OR BTRIM(phonenumber) <> '');

COMMIT;
