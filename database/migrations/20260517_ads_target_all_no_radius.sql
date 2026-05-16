UPDATE PROMOTION
SET
    TargetAudience = 'all',
    TargetRadiusKm = NULL
WHERE PromotionType = 'Advertisement';

ALTER TABLE PROMOTION
    DROP CONSTRAINT IF EXISTS chk_promotion_advertisement_target_all;

ALTER TABLE PROMOTION
    ADD CONSTRAINT chk_promotion_advertisement_target_all
        CHECK (
            PromotionType <> 'Advertisement'
            OR (
                TargetAudience = 'all'
                AND TargetRadiusKm IS NULL
            )
        );
