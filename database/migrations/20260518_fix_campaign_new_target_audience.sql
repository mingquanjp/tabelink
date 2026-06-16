DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'promotion'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%targetaudience%'
    LOOP
        EXECUTE format(
            'ALTER TABLE PROMOTION DROP CONSTRAINT IF EXISTS %I',
            constraint_record.conname
        );
    END LOOP;
END $$;

UPDATE PROMOTION
SET TargetAudience = 'all'
WHERE PromotionType = 'Campaign'
  AND COALESCE(TargetAudience, '') NOT IN ('all', 'new');

UPDATE PROMOTION
SET
    TargetAudience = 'all',
    TargetRadiusKm = NULL
WHERE PromotionType = 'Advertisement';

ALTER TABLE PROMOTION
    ADD CONSTRAINT chk_promotion_campaign_target_audience
        CHECK (
            PromotionType <> 'Campaign'
            OR TargetAudience IN ('all', 'new')
        );

ALTER TABLE PROMOTION
    ADD CONSTRAINT chk_promotion_advertisement_target_all
        CHECK (
            PromotionType <> 'Advertisement'
            OR (
                TargetAudience = 'all'
                AND TargetRadiusKm IS NULL
            )
        );
