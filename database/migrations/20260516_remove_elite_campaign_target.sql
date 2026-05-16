UPDATE PROMOTION
SET TargetAudience = 'all'
WHERE PromotionType = 'Campaign'
  AND TargetAudience NOT IN ('all', 'new');
