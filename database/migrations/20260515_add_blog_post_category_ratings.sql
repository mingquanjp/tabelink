BEGIN;

ALTER TABLE blog_post
    ADD COLUMN IF NOT EXISTS tasterating INT CHECK (tasterating BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS hygienerating INT CHECK (hygienerating BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS servicerating INT CHECK (servicerating BETWEEN 1 AND 5);

COMMIT;
