BEGIN;

DO $$
DECLARE
    v_restaurant_id INT := 1;
    v_owner_id INT;
    v_admin_id INT := 9001;
    v_verified_badge_id INT;
BEGIN
    INSERT INTO user_account (accountid, email, passwordhash, role, status)
    VALUES
        (v_admin_id, 'seed.admin@tabelink.local', '$2b$10$XN09Rcw/OXVaMFzC.hGhl.1LcN.8TC88DBLEV6te9Yh8XrIcis1z6', 'Admin', 'Active'),
        (9002, 'seed.owner.home@tabelink.local', '$2b$10$XN09Rcw/OXVaMFzC.hGhl.1LcN.8TC88DBLEV6te9Yh8XrIcis1z6', 'Owner', 'Active'),
        (9010, 'seed.kenji@tabelink.local', '$2b$10$XN09Rcw/OXVaMFzC.hGhl.1LcN.8TC88DBLEV6te9Yh8XrIcis1z6', 'User', 'Active'),
        (9011, 'seed.nguyenh@tabelink.local', '$2b$10$XN09Rcw/OXVaMFzC.hGhl.1LcN.8TC88DBLEV6te9Yh8XrIcis1z6', 'User', 'Active'),
        (9012, 'seed.hiroshi@tabelink.local', '$2b$10$XN09Rcw/OXVaMFzC.hGhl.1LcN.8TC88DBLEV6te9Yh8XrIcis1z6', 'User', 'Active'),
        (9013, 'seed.mai@tabelink.local', '$2b$10$XN09Rcw/OXVaMFzC.hGhl.1LcN.8TC88DBLEV6te9Yh8XrIcis1z6', 'User', 'Active')
    ON CONFLICT (accountid) DO UPDATE
    SET status = EXCLUDED.status,
        passwordhash = EXCLUDED.passwordhash,
        updatedat = CURRENT_TIMESTAMP;

    INSERT INTO owner_profile (accountid, fullname, phone, businessname, avatarurl)
    VALUES
        (9002, 'Seed Owner Home', '+84 90 000 9002', 'Hoang Yen Cuisine', NULL)
    ON CONFLICT (accountid) DO UPDATE
    SET fullname = EXCLUDED.fullname,
        phone = EXCLUDED.phone,
        businessname = EXCLUDED.businessname,
        avatarurl = EXCLUDED.avatarurl;

    SELECT owneraccountid
    INTO v_owner_id
    FROM restaurant
    WHERE restaurantid = v_restaurant_id;

    IF v_owner_id IS NULL THEN
        v_owner_id := 9002;
    END IF;

    INSERT INTO customer_profile (
        accountid,
        fullname,
        displayname,
        gender,
        dob,
        nationality,
        purpose,
        avatarurl
    )
    VALUES
        (9010, 'Kenji Sato', 'Kenji Sato', 'Male', '1989-03-14', 'Japan', 'Resident', NULL),
        (9011, 'Nguyen Huong', 'Nguyen H.', 'Female', '1994-08-21', 'Vietnam', 'Local Foodie', NULL),
        (9012, 'Hiroshi Yamada', 'Hiroshi Y.', 'Male', '1985-11-03', 'Japan', 'Business', NULL),
        (9013, 'Mai Tran', 'Mai T.', 'Female', '1996-02-09', 'Vietnam', 'Food blogger', NULL)
    ON CONFLICT (accountid) DO UPDATE
    SET fullname = EXCLUDED.fullname,
        displayname = EXCLUDED.displayname,
        gender = EXCLUDED.gender,
        dob = EXCLUDED.dob,
        nationality = EXCLUDED.nationality,
        purpose = EXCLUDED.purpose,
        avatarurl = EXCLUDED.avatarurl;

    INSERT INTO restaurant (
        restaurantid,
        owneraccountid,
        namevn,
        namejp,
        address,
        latitude,
        longitude,
        descriptionvn,
        descriptionjp,
        issuesvat,
        phone,
        openinghours,
        status
    )
    VALUES (
        v_restaurant_id,
        v_owner_id,
        'Hoang Yen Cuisine',
        'ホアン・イエン・キュイジーヌ',
        '7-9 Ngo Duc Ke, Ben Nghe, Quan 1, TP.HCM',
        10.77315900,
        106.70394300,
        'Nha hang Viet Nam truyen thong phu hop voi khach Nhat.',
        '日本人のお客様にも利用しやすい伝統的なベトナム料理店です。',
        TRUE,
        '+84 28 3823 1101',
        '10:00-22:00',
        'Active'
    )
    ON CONFLICT (restaurantid) DO UPDATE
    SET namevn = EXCLUDED.namevn,
        namejp = EXCLUDED.namejp,
        address = EXCLUDED.address,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        descriptionvn = EXCLUDED.descriptionvn,
        descriptionjp = EXCLUDED.descriptionjp,
        issuesvat = EXCLUDED.issuesvat,
        phone = EXCLUDED.phone,
        openinghours = EXCLUDED.openinghours,
        status = EXCLUDED.status,
        updatedat = CURRENT_TIMESTAMP;

    DELETE FROM restaurant_media
    WHERE restaurantid = v_restaurant_id
      AND mediaurl LIKE 'https://images.unsplash.com/%';

    INSERT INTO restaurant_media (restaurantid, mediaurl, mediatype, sortorder, status)
    VALUES
        (v_restaurant_id, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 'Cover', 0, 'Approved'),
        (v_restaurant_id, 'https://images.unsplash.com/photo-1559847844-5315695dadae', 'Photo', 1, 'Approved'),
        (v_restaurant_id, 'https://images.unsplash.com/photo-1551218808-94e220e084d2', 'Photo', 2, 'Approved'),
        (v_restaurant_id, 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c', 'Photo', 3, 'Approved');

    INSERT INTO restaurant_social_link (
        restaurantid,
        provider,
        url,
        displaylabel,
        sortorder,
        isactive
    )
    VALUES
        (v_restaurant_id, 'Facebook', 'https://facebook.com/hoang-yen-cuisine-seed', 'Facebook', 0, TRUE),
        (v_restaurant_id, 'Instagram', 'https://instagram.com/hoangyencuisine.seed', 'Instagram', 1, TRUE)
    ON CONFLICT (restaurantid, provider) DO UPDATE
    SET url = EXCLUDED.url,
        displaylabel = EXCLUDED.displaylabel,
        sortorder = EXCLUDED.sortorder,
        isactive = EXCLUDED.isactive;

    INSERT INTO feature_master (featurecode, featurenamevn, featurenamejp)
    VALUES
        ('JAPANESE_STAFF', 'Co nhan vien biet tieng Nhat', '日本人スタッフ在籍'),
        ('VAT_SUPPORT', 'Ho tro hoa don VAT', 'VAT対応'),
        ('PRIVATE_ROOM', 'Co phong rieng', '個室あり')
    ON CONFLICT (featurecode) DO UPDATE
    SET featurenamevn = EXCLUDED.featurenamevn,
        featurenamejp = EXCLUDED.featurenamejp;

    INSERT INTO payment_method (methodcode, methodname)
    VALUES
        ('JCB', 'JCB Card'),
        ('CASH', 'Cash'),
        ('VISA', 'Visa / Mastercard')
    ON CONFLICT (methodcode) DO UPDATE
    SET methodname = EXCLUDED.methodname;

    INSERT INTO restaurant_feature (restaurantid, featureid)
    SELECT v_restaurant_id, featureid
    FROM feature_master
    WHERE featurecode IN ('JAPANESE_STAFF', 'VAT_SUPPORT', 'PRIVATE_ROOM')
    ON CONFLICT (restaurantid, featureid) DO NOTHING;

    INSERT INTO restaurant_payment_method (restaurantid, paymentmethodid)
    SELECT v_restaurant_id, paymentmethodid
    FROM payment_method
    WHERE methodcode IN ('JCB', 'CASH', 'VISA')
    ON CONFLICT (restaurantid, paymentmethodid) DO NOTHING;

    INSERT INTO menu_category (
        restaurantid,
        categorycode,
        categorynamevn,
        categorynamejp,
        sortorder,
        isactive
    )
    VALUES
        (v_restaurant_id, 'main', 'Mon chinh', 'メイン料理', 0, TRUE),
        (v_restaurant_id, 'starter', 'Khai vi', 'スターター', 1, TRUE),
        (v_restaurant_id, 'dessert', 'Trang mieng', 'デザート', 2, TRUE)
    ON CONFLICT (restaurantid, categorycode) DO UPDATE
    SET categorynamevn = EXCLUDED.categorynamevn,
        categorynamejp = EXCLUDED.categorynamejp,
        sortorder = EXCLUDED.sortorder,
        isactive = EXCLUDED.isactive;

    INSERT INTO menu_item (
        itemid,
        restaurantid,
        categoryid,
        namevn,
        namejp,
        price,
        descriptionvn,
        descriptionjp,
        ingredients,
        isrecommendedforjp,
        imageurl,
        imagepublicid,
        isactive,
        deletedat
    )
    VALUES
        (9101, v_restaurant_id, (SELECT categoryid FROM menu_category WHERE restaurantid = v_restaurant_id AND categorycode = 'starter'), 'Nem ran truyen thong', '伝統的な揚げ春巻き', 120000, 'Nem ran gion voi rau song va nuoc cham.', 'マイルドな味わいで、日本の方にも人気の揚げ春巻きです。', 'Thit heo, mien, moc nhi, banh da nem', TRUE, 'https://images.unsplash.com/photo-1544025162-d76694265947', NULL, TRUE, NULL),
        (9102, v_restaurant_id, (SELECT categoryid FROM menu_category WHERE restaurantid = v_restaurant_id AND categorycode = 'starter'), 'Goi ngo sen tom thit', '蓮の茎と海老のサラダ', 185000, 'Salad ngo sen thanh mat voi tom va thit.', 'シャキシャキとした蓮の茎の食感が特徴のさっぱりサラダです。', 'Ngo sen, tom, thit heo, rau ram', TRUE, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', NULL, TRUE, NULL),
        (9103, v_restaurant_id, (SELECT categoryid FROM menu_category WHERE restaurantid = v_restaurant_id AND categorycode = 'main'), 'Thit heo nuong kieu tre', '竹筒入りの豚肉焼き', 245000, 'Thit heo nuong dam vi voi xa va tieu.', '香ばしい豚肉で、スパイスを控えめに調整できます。', 'Thit heo, xa, tieu, mat ong', TRUE, 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba', NULL, FALSE, NULL),
        (9104, v_restaurant_id, (SELECT categoryid FROM menu_category WHERE restaurantid = v_restaurant_id AND categorycode = 'main'), 'Ca hap Hong Kong', 'シーバスの香港蒸し', 580000, 'Ca hap xi dau, hanh va gung.', '非常に柔らかく蒸し上げた白身魚で、日本人の口にも合う味付けです。', 'Ca seabass, xi dau, gung, hanh', TRUE, 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b', NULL, TRUE, NULL)
    ON CONFLICT (itemid) DO UPDATE
    SET restaurantid = EXCLUDED.restaurantid,
        categoryid = EXCLUDED.categoryid,
        namevn = EXCLUDED.namevn,
        namejp = EXCLUDED.namejp,
        price = EXCLUDED.price,
        descriptionvn = EXCLUDED.descriptionvn,
        descriptionjp = EXCLUDED.descriptionjp,
        ingredients = EXCLUDED.ingredients,
        isrecommendedforjp = EXCLUDED.isrecommendedforjp,
        imageurl = EXCLUDED.imageurl,
        imagepublicid = EXCLUDED.imagepublicid,
        isactive = EXCLUDED.isactive,
        deletedat = EXCLUDED.deletedat,
        updatedat = CURRENT_TIMESTAMP;

    DELETE FROM menu_item_criterion
    WHERE itemid IN (9101, 9102, 9103, 9104);

    INSERT INTO menu_item_criterion (itemid, criterionname, ratinglevel, sortorder)
    VALUES
        (9101, '辛さ', 1, 0),
        (9101, 'パクチー', 2, 1),
        (9102, '辛さ', 2, 0),
        (9102, 'パクチー', 1, 1),
        (9103, '辛さ', 2, 0),
        (9103, 'パクチー', 3, 1),
        (9104, '辛さ', 1, 0),
        (9104, 'パクチー', 1, 1);

    INSERT INTO promotion (
        promotionid,
        restaurantid,
        createdbyowneraccountid,
        approvedbyadminid,
        promotiontype,
        targetaudience,
        titlevn,
        titlejp,
        contentvn,
        contentjp,
        mediaurl,
        termsvn,
        termsjp,
        startdate,
        enddate,
        status,
        impressions,
        clicks,
        totalcost
    )
    VALUES
        (9201, v_restaurant_id, v_owner_id, v_admin_id, 'Campaign', 'Japanese residents in Hanoi', 'Giam 10% cho set nem ran', '揚げ春巻きセット10%OFF', 'Ap dung cho khach dat ban trong tuan.', '今週予約のお客様限定キャンペーンです。', 'https://images.unsplash.com/photo-1551218808-94e220e084d2', 'Khong ap dung dong thoi voi uu dai khac.', '他の割引との併用はできません。', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '21 days', 'Active', 850, 74, 1500000),
        (9202, v_restaurant_id, v_owner_id, v_admin_id, 'Campaign', 'First-time Japanese customers', 'Tang tra da Viet Nam', '初回予約でベトナム茶サービス', 'Tang tra da cho nhom tu 2 khach.', '2名様以上の初回予約でベトナム茶をサービスします。', 'https://images.unsplash.com/photo-1544145945-f90425340c7e', 'Ap dung khi xac nhan dat ban.', '予約確定時に適用されます。', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '14 days', 'Active', 420, 31, 800000)
    ON CONFLICT (promotionid) DO UPDATE
    SET restaurantid = EXCLUDED.restaurantid,
        createdbyowneraccountid = EXCLUDED.createdbyowneraccountid,
        approvedbyadminid = EXCLUDED.approvedbyadminid,
        promotiontype = EXCLUDED.promotiontype,
        targetaudience = EXCLUDED.targetaudience,
        titlevn = EXCLUDED.titlevn,
        titlejp = EXCLUDED.titlejp,
        contentvn = EXCLUDED.contentvn,
        contentjp = EXCLUDED.contentjp,
        mediaurl = EXCLUDED.mediaurl,
        termsvn = EXCLUDED.termsvn,
        termsjp = EXCLUDED.termsjp,
        startdate = EXCLUDED.startdate,
        enddate = EXCLUDED.enddate,
        status = EXCLUDED.status,
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        totalcost = EXCLUDED.totalcost;

    INSERT INTO hashtag (name)
    VALUES
        ('在住日本人'),
        ('ベトナム人'),
        ('衛生・サービス確認済み'),
        ('予約の安心感確認済み'),
        ('Local Foodie')
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO review (
        reviewid,
        customeraccountid,
        restaurantid,
        reservationid,
        rating,
        toiletcleanliness,
        dishcleanliness,
        spacecleanliness,
        content,
        sentiment,
        isjapanesetag,
        status,
        createdat
    )
    VALUES
        (9301, 9010, v_restaurant_id, NULL, 5, 5, 5, 4, 'とにかく清潔感が素晴らしい。おしぼりも綺麗で、トイレの清掃も行き届いています。全般で利用しやすく、ベトナム料理が初めての出張者も大満足でした。', 'Positive', TRUE, 'Visible', CURRENT_TIMESTAMP - INTERVAL '2 days'),
        (9302, 9011, v_restaurant_id, NULL, 4, 4, 5, 4, 'Gia dinh toi thuong xuyen den day vao cuoi tuan. Khong gian am cung, mon an mang huong vi truyen thong nhung trinh bay rat hien dai.', 'Positive', FALSE, 'Visible', CURRENT_TIMESTAMP - INTERVAL '5 days'),
        (9303, 9012, v_restaurant_id, NULL, 5, 4, 5, 5, '日本人スタッフの方がいるので、予約時の細かな要望が日本語で伝えられるのが最大の安心材料です。', 'Positive', TRUE, 'Visible', CURRENT_TIMESTAMP - INTERVAL '8 days')
    ON CONFLICT (reviewid) DO UPDATE
    SET customeraccountid = EXCLUDED.customeraccountid,
        restaurantid = EXCLUDED.restaurantid,
        reservationid = EXCLUDED.reservationid,
        rating = EXCLUDED.rating,
        toiletcleanliness = EXCLUDED.toiletcleanliness,
        dishcleanliness = EXCLUDED.dishcleanliness,
        spacecleanliness = EXCLUDED.spacecleanliness,
        content = EXCLUDED.content,
        sentiment = EXCLUDED.sentiment,
        isjapanesetag = EXCLUDED.isjapanesetag,
        status = EXCLUDED.status,
        createdat = EXCLUDED.createdat,
        updatedat = CURRENT_TIMESTAMP;

    DELETE FROM review_media
    WHERE reviewid IN (9301, 9302, 9303);

    INSERT INTO review_media (reviewid, mediaurl, mediatype, sortorder)
    VALUES
        (9301, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', 'Photo', 0),
        (9302, 'https://images.unsplash.com/photo-1559847844-5315695dadae', 'Photo', 0),
        (9303, 'https://images.unsplash.com/photo-1551218808-94e220e084d2', 'Photo', 0);

    DELETE FROM review_tag
    WHERE reviewid IN (9301, 9302, 9303);

    INSERT INTO review_tag (reviewid, tagid)
    SELECT 9301, tagid FROM hashtag WHERE name IN ('在住日本人', '衛生・サービス確認済み')
    ON CONFLICT DO NOTHING;

    INSERT INTO review_tag (reviewid, tagid)
    SELECT 9302, tagid FROM hashtag WHERE name IN ('ベトナム人', 'Local Foodie')
    ON CONFLICT DO NOTHING;

    INSERT INTO review_tag (reviewid, tagid)
    SELECT 9303, tagid FROM hashtag WHERE name IN ('在住日本人', '予約の安心感確認済み')
    ON CONFLICT DO NOTHING;

    INSERT INTO badge_master (
        badgecode,
        badgenamevn,
        badgenamejp,
        descriptionvn,
        descriptionjp,
        criteria
    )
    VALUES (
        'VERIFIED',
        'Da xac thuc',
        '認証済み',
        'Nha hang da duoc TABELINK xac thuc ho so.',
        'TABELINKにより確認済みのレストランです。',
        'Business license, food safety certificate'
    )
    ON CONFLICT (badgecode) DO UPDATE
    SET badgenamevn = EXCLUDED.badgenamevn,
        badgenamejp = EXCLUDED.badgenamejp,
        descriptionvn = EXCLUDED.descriptionvn,
        descriptionjp = EXCLUDED.descriptionjp,
        criteria = EXCLUDED.criteria;

    SELECT badgeid
    INTO v_verified_badge_id
    FROM badge_master
    WHERE badgecode = 'VERIFIED';

    INSERT INTO restaurant_badge (
        restaurantid,
        badgeid,
        grantedbyadminid,
        grantedat,
        expiresat
    )
    VALUES (
        v_restaurant_id,
        v_verified_badge_id,
        v_admin_id,
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        NULL
    )
    ON CONFLICT (restaurantid, badgeid) DO UPDATE
    SET grantedbyadminid = EXCLUDED.grantedbyadminid,
        grantedat = EXCLUDED.grantedat,
        expiresat = EXCLUDED.expiresat;
END;
$$;

COMMIT;
