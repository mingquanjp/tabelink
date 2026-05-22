UPDATE USER_ACCOUNT
SET Status = 'Active'
WHERE Status = 'Pending';

ALTER TABLE USER_ACCOUNT
    ALTER COLUMN Status SET DEFAULT 'Active';

ALTER TABLE USER_ACCOUNT
    DROP CONSTRAINT IF EXISTS user_account_status_check;

ALTER TABLE USER_ACCOUNT
    ADD CONSTRAINT user_account_status_check
    CHECK (Status IN ('Active', 'Banned', 'Disabled'));
