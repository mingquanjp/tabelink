SELECT setval(
    pg_get_serial_sequence('promotion', 'promotionid'),
    GREATEST(COALESCE((SELECT MAX(PromotionID) FROM PROMOTION), 0), 1),
    COALESCE((SELECT MAX(PromotionID) FROM PROMOTION), 0) > 0
);
