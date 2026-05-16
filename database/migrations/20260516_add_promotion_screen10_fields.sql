ALTER TABLE PROMOTION
    ADD COLUMN IF NOT EXISTS DiscountType VARCHAR(100),
    ADD COLUMN IF NOT EXISTS DiscountValue VARCHAR(255),
    ADD COLUMN IF NOT EXISTS AdvertisementType VARCHAR(50),
    ADD COLUMN IF NOT EXISTS TargetRadiusKm INT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_promotion_discount_type_not_blank'
    ) THEN
        ALTER TABLE PROMOTION
            ADD CONSTRAINT chk_promotion_discount_type_not_blank
                CHECK (DiscountType IS NULL OR BTRIM(DiscountType) <> '');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_promotion_discount_value_not_blank'
    ) THEN
        ALTER TABLE PROMOTION
            ADD CONSTRAINT chk_promotion_discount_value_not_blank
                CHECK (DiscountValue IS NULL OR BTRIM(DiscountValue) <> '');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_promotion_advertisement_type'
    ) THEN
        ALTER TABLE PROMOTION
            ADD CONSTRAINT chk_promotion_advertisement_type
                CHECK (AdvertisementType IS NULL OR AdvertisementType IN ('Banner', 'Push'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_promotion_target_radius_km'
    ) THEN
        ALTER TABLE PROMOTION
            ADD CONSTRAINT chk_promotion_target_radius_km
                CHECK (TargetRadiusKm IS NULL OR TargetRadiusKm BETWEEN 1 AND 100);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_promotion_advertisement_type
    ON PROMOTION(AdvertisementType)
    WHERE AdvertisementType IS NOT NULL;

UPDATE PROMOTION
SET
    TargetAudience = CASE
        WHEN TargetAudience IN ('all', 'new', 'elite') THEN TargetAudience
        ELSE 'all'
    END,
    DiscountType = COALESCE(NULLIF(BTRIM(DiscountType), ''), '10'),
    DiscountValue = COALESCE(NULLIF(BTRIM(DiscountValue), ''), '10%OFF'),
    MediaURL = NULL
WHERE PromotionType = 'Campaign';
