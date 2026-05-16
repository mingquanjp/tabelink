ALTER TABLE PROMOTION
    DROP CONSTRAINT IF EXISTS chk_promotion_advertisement_type;

UPDATE PROMOTION
SET
    AdvertisementType = CASE AdvertisementType
        WHEN 'Banner' THEN 'SNS'
        WHEN 'Push' THEN 'Notification'
        ELSE AdvertisementType
    END,
    DiscountType = NULL,
    DiscountValue = NULL
WHERE PromotionType = 'Advertisement';

ALTER TABLE PROMOTION
    ADD CONSTRAINT chk_promotion_advertisement_type
        CHECK (AdvertisementType IS NULL OR AdvertisementType IN ('SNS', 'Notification'));
