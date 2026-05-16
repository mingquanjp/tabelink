UPDATE PROMOTION
SET
    DiscountType = CASE
        WHEN DiscountValue IN ('50000VND', '100000VND', '200000VND') THEN 'FixedAmount'
        ELSE 'Percentage'
    END,
    DiscountValue = CASE
        WHEN DiscountValue IN ('10%', '20%', '50%', '100%', '50000VND', '100000VND', '200000VND') THEN DiscountValue
        WHEN DiscountValue ~ '^[0-9]+%OFF' AND REPLACE(DiscountValue, '%OFF', '%') IN ('10%', '20%', '50%', '100%') THEN REPLACE(DiscountValue, '%OFF', '%')
        WHEN DiscountType ~ '^[0-9]+$' AND (DiscountType || '%') IN ('10%', '20%', '50%', '100%') THEN DiscountType || '%'
        ELSE '10%'
    END
WHERE PromotionType = 'Campaign';

ALTER TABLE PROMOTION
    DROP CONSTRAINT IF EXISTS chk_promotion_campaign_discount_value;

ALTER TABLE PROMOTION
    ADD CONSTRAINT chk_promotion_campaign_discount_value
        CHECK (
            PromotionType <> 'Campaign'
            OR (
                DiscountType = 'Percentage'
                AND DiscountValue IN ('10%', '20%', '50%', '100%')
            )
            OR (
                DiscountType = 'FixedAmount'
                AND DiscountValue IN ('50000VND', '100000VND', '200000VND')
            )
        );
