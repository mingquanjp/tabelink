BEGIN;

ALTER TABLE hashtag
    DROP CONSTRAINT IF EXISTS ck_hashtag_name_not_blank;

ALTER TABLE hashtag
    ADD CONSTRAINT ck_hashtag_name_not_blank
    CHECK (BTRIM(name) <> '');

COMMIT;
