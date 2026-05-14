CREATE INDEX IF NOT EXISTS idx_menu_item_owner_list
    ON MENU_ITEM(RestaurantID, DeletedAt, IsActive DESC, IsRecommendedForJP DESC, ItemID);

CREATE INDEX IF NOT EXISTS idx_reservation_restaurant_status_time
    ON RESERVATION(RestaurantID, Status, ReservationDateTime);

CREATE INDEX IF NOT EXISTS idx_reservation_item_restaurant_item
    ON RESERVATION_ITEM(RestaurantID, ItemID);

CREATE INDEX IF NOT EXISTS idx_reservation_item_restaurant_reservation
    ON RESERVATION_ITEM(RestaurantID, ReservationID);

CREATE INDEX IF NOT EXISTS idx_review_restaurant_status_created
    ON REVIEW(RestaurantID, Status, CreatedAt DESC, ReviewID DESC);

CREATE INDEX IF NOT EXISTS idx_promotion_restaurant_type_status_date
    ON PROMOTION(RestaurantID, PromotionType, Status, StartDate, EndDate);
