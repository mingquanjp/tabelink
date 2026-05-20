BEGIN;

ALTER TABLE special_request_template
    DROP COLUMN IF EXISTS textvn,
    DROP COLUMN IF EXISTS descriptionvn;

COMMIT;
