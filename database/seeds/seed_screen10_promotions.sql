-- Screen ID10 campaign/ad seed data.
-- Idempotent: safe to run multiple times.

INSERT INTO PROMOTION (
    PromotionID,
    RestaurantID,
    CreatedByOwnerAccountID,
    ApprovedByAdminID,
    PromotionType,
    TargetAudience,
    TitleVN,
    TitleJP,
    ContentVN,
    ContentJP,
    MediaURL,
    TermsVN,
    TermsJP,
    DiscountType,
    DiscountValue,
    AdvertisementType,
    TargetRadiusKm,
    StartDate,
    EndDate,
    Status,
    Impressions,
    Clicks,
    TotalCost
) VALUES
    (8101, 1001, 101, 1, 'Campaign', 'all', 'Weekend percentage campaign', 'Weekend percentage campaign', 'Percentage discount for all customers.', 'Percentage discount for all customers.', NULL, 'Cannot be combined with other coupons.', 'Cannot be combined with other coupons.', 'Percentage', '10%', NULL, NULL, '2026-05-01T00:00:00Z', '2026-08-31T23:59:59Z', 'Active', 412, 36, 0),
    (8102, 1001, 101, NULL, 'Campaign', 'new', 'New customer fixed discount', 'New customer fixed discount', 'Fixed amount discount for new customers.', 'Fixed amount discount for new customers.', NULL, 'One use per customer.', 'One use per customer.', 'FixedAmount', '50000VND', NULL, NULL, '2026-05-20T00:00:00Z', '2026-07-20T23:59:59Z', 'Pending', 0, 0, 0),
    (8103, 1002, 102, 1, 'Campaign', 'all', 'High value percentage campaign', 'High value percentage campaign', 'Large percentage discount for all customers.', 'Large percentage discount for all customers.', NULL, 'Limited campaign period.', 'Limited campaign period.', 'Percentage', '50%', NULL, NULL, '2026-05-10T00:00:00Z', '2026-08-10T23:59:59Z', 'Active', 520, 51, 0),
    (8104, 1003, 103, 1, 'Campaign', 'new', 'Premium fixed amount campaign', 'Premium fixed amount campaign', 'Fixed amount discount for new customers.', 'Fixed amount discount for new customers.', NULL, 'Reservation required.', 'Reservation required.', 'FixedAmount', '200000VND', NULL, NULL, '2026-05-05T00:00:00Z', '2026-06-30T23:59:59Z', 'Rejected', 0, 0, 0),
    (8111, 1001, 101, 1, 'Advertisement', 'all', 'SNS weekend ad', 'SNS weekend ad', 'Promote weekend menu through SNS/banner placement.', 'Promote weekend menu through SNS/banner placement.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&h=700&q=80', NULL, NULL, NULL, NULL, 'SNS', NULL, '2026-05-01T00:00:00Z', '2026-08-31T23:59:59Z', 'Active', 1880, 143, 500000),
    (8112, 1001, 101, 1, 'Advertisement', 'all', 'Notification lunch ad', 'Notification lunch ad', 'Send lunch promotion notification to all users.', 'Send lunch promotion notification to all users.', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&h=700&q=80', NULL, NULL, NULL, NULL, 'Notification', NULL, '2026-05-01T00:00:00Z', '2026-07-15T23:59:59Z', 'Active', 0, 0, 250000),
    (8113, 1002, 102, 1, 'Advertisement', 'all', 'SNS dinner ad', 'SNS dinner ad', 'Promote dinner course through SNS/banner placement.', 'Promote dinner course through SNS/banner placement.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=700&q=80', NULL, NULL, NULL, NULL, 'SNS', NULL, '2026-05-10T00:00:00Z', '2026-08-10T23:59:59Z', 'Active', 2310, 198, 750000),
    (8114, 1003, 103, 1, 'Advertisement', 'all', 'Notification course ad', 'Notification course ad', 'Notify all users about the seasonal course.', 'Notify all users about the seasonal course.', 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&h=700&q=80', NULL, NULL, NULL, NULL, 'Notification', NULL, '2026-05-05T00:00:00Z', '2026-06-30T23:59:59Z', 'Rejected', 0, 0, 300000)
ON CONFLICT (PromotionID) DO UPDATE SET
    RestaurantID = EXCLUDED.RestaurantID,
    CreatedByOwnerAccountID = EXCLUDED.CreatedByOwnerAccountID,
    ApprovedByAdminID = EXCLUDED.ApprovedByAdminID,
    PromotionType = EXCLUDED.PromotionType,
    TargetAudience = EXCLUDED.TargetAudience,
    TitleVN = EXCLUDED.TitleVN,
    TitleJP = EXCLUDED.TitleJP,
    ContentVN = EXCLUDED.ContentVN,
    ContentJP = EXCLUDED.ContentJP,
    MediaURL = EXCLUDED.MediaURL,
    TermsVN = EXCLUDED.TermsVN,
    TermsJP = EXCLUDED.TermsJP,
    DiscountType = EXCLUDED.DiscountType,
    DiscountValue = EXCLUDED.DiscountValue,
    AdvertisementType = EXCLUDED.AdvertisementType,
    TargetRadiusKm = EXCLUDED.TargetRadiusKm,
    StartDate = EXCLUDED.StartDate,
    EndDate = EXCLUDED.EndDate,
    Status = EXCLUDED.Status,
    Impressions = EXCLUDED.Impressions,
    Clicks = EXCLUDED.Clicks,
    TotalCost = EXCLUDED.TotalCost;

SELECT setval(
    pg_get_serial_sequence('promotion', 'promotionid'),
    GREATEST(COALESCE((SELECT MAX(PromotionID) FROM PROMOTION), 0), 1),
    COALESCE((SELECT MAX(PromotionID) FROM PROMOTION), 0) > 0
);
