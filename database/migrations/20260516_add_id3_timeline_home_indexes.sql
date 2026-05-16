CREATE INDEX IF NOT EXISTS idx_user_follow_followed
    ON user_follow(followedaccountid);

CREATE INDEX IF NOT EXISTS idx_review_restaurant_visible_rating
    ON review(restaurantid, status, rating);

CREATE INDEX IF NOT EXISTS idx_blog_comment_blog_status_created
    ON blog_comment(blogid, status, createdat, commentid);

CREATE INDEX IF NOT EXISTS idx_promotion_home_ads
    ON promotion(promotiontype, status, startdate, enddate);
