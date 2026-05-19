CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_restaurant_map_active_location
    ON restaurant(status, latitude, longitude)
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurant_map_active_vat
    ON restaurant(status, issuesvat)
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurant_map_namevn_trgm
    ON restaurant USING gin (namevn gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_restaurant_map_namejp_trgm
    ON restaurant USING gin (namejp gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_restaurant_map_address_trgm
    ON restaurant USING gin (address gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_menu_item_restaurant_category
    ON menu_item(restaurantid, categoryid);

CREATE INDEX IF NOT EXISTS idx_restaurant_feature_restaurant_feature
    ON restaurant_feature(restaurantid, featureid);

CREATE INDEX IF NOT EXISTS idx_review_restaurant_visible_cleanliness
    ON review(restaurantid, status, toiletcleanliness, dishcleanliness, spacecleanliness);
