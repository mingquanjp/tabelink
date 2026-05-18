-- Ensure the user notification bell has an active Notification advertisement
-- in the current demo window.

UPDATE PROMOTION
SET
    ApprovedByAdminID = 1,
    StartDate = '2026-05-01T00:00:00Z',
    EndDate = '2026-07-15T23:59:59Z',
    Status = 'Active'
WHERE PromotionID = 8112
  AND PromotionType = 'Advertisement'
  AND AdvertisementType = 'Notification';
