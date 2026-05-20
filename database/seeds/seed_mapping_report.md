# Tabelink Japanese Seed Mapping Report

Generated for:

- Schema source: `database/inits.sql`
- Seed generator: `database/seeds/generate_mock_sql.py`
- Generated SQL: `database/seeds/mock_data.sql`
- Common mock password: `Password123!`
- Stored password format: bcrypt hash in `USER_ACCOUNT.PasswordHash`

## Executive Summary

| Metric | Result |
|---|---:|
| Tables in schema | 35 |
| Tables covered by seed generator | 35 |
| Missing tables | 0 |
| Extra tables not in schema | 0 |
| Schema columns checked against generated seed rows | 100% |
| Main account count | 43 |
| Restaurant count | 12 |
| Menu category count | 60 |
| Menu item count | 180 |
| Reservation count | 250 |
| Review count | 264 |
| Blog post count | 60 |
| Promotion count | 108 |
| Campaign discount rows | 84 |
| Advertisement rows | 24 |
| Restaurant analytics rows | 540 |
| Menu item analytics rows | 5,400 |
| Moderation log rows | 40 |

## Login Test Accounts

All mock accounts use the same password:

```text
Password123!
```

Useful accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin1@tabelink.test` | `Password123!` |
| Owner | `owner01@tabelink.test` | `Password123!` |
| Owner | `owner02@tabelink.test` | `Password123!` |
| User | `user01@tabelink.test` | `Password123!` |
| User | `user02@tabelink.test` | `Password123!` |

## Table Coverage

| Table | Seed Rows | Notes |
|---|---:|---|
| `USER_ACCOUNT` | 36 | Admin, owner, and user accounts. |
| `FEATURE_MASTER` | 4 | Japanese display names. |
| `PAYMENT_METHOD` | 4 | Japanese method names. |
| `HASHTAG` | 6 | Japanese tags. |
| `SPECIAL_REQUEST_TEMPLATE` | 4 | Japanese request text and descriptions. |
| `BADGE_MASTER` | 2 | Japanese badge names/descriptions. |
| `CUSTOMER_PROFILE` | 30 | Japanese profile names and purposes. |
| `OWNER_PROFILE` | 12 | One owner per restaurant. |
| `USER_FOLLOW` | 24 | Social graph seed. |
| `RESTAURANT` | 12 | Japanese names, addresses, and descriptions around Hanoi University of Science and Technology. |
| `RESTAURANT_MEDIA` | 48 | Four real Unsplash web URLs per restaurant. |
| `RESTAURANT_SOCIAL_LINK` | 12 | Website links per restaurant. |
| `RESTAURANT_FEATURE` | 47 | Feature coverage per restaurant. |
| `RESTAURANT_PAYMENT_METHOD` | 36 | Mixed payment support. |
| `MENU_CATEGORY` | 60 | Five categories per restaurant. |
| `MENU_ITEM` | 180 | Fifteen Japanese menu items per restaurant. |
| `MENU_ITEM_CRITERION` | 540 | Taste, cleanliness, and Japan-friendly ratings. |
| `RESTAURANT_TABLE` | 72 | Six tables per restaurant. |
| `RESERVATION` | 250 | Active slot uniqueness checked. |
| `RESERVATION_ITEM` | 499 | Valid item/restaurant pairs. |
| `RESERVATION_SPECIAL_REQUEST` | 109 | Template and custom Japanese requests. |
| `REVIEW` | 264 | Japanese review content, with at least 12 visible reviews per restaurant detail page. |
| `BLOG_POST` | 60 | Japanese titles/content and ratings. |
| `BLOG_MEDIA` | 60 | Real Unsplash web URLs. |
| `BLOG_TAG` | 120 | Japanese hashtag links. |
| `BLOG_LIKE` | 60 | Social interactions. |
| `BLOG_COMMENT` | 60 | Japanese comments. |
| `BLOG_SHARE` | 60 | Share rows. |
| `PROMOTION` | 108 | 84 discount campaigns plus SNS/Notification advertisements. |
| `PROMOTION_REDEMPTION` | 72 | Matched to same-restaurant reservations. |
| `BADGE_APPLICATION` | 12 | Approved applications with real public PDF URL. |
| `RESTAURANT_BADGE` | 15 | Verified and Japan-friendly badges. |
| `MODERATION_LOG` | 40 | Japanese moderation reasons. |
| `RESTAURANT_ANALYTICS_DAILY` | 540 | 45 days per restaurant. |
| `MENU_ITEM_ANALYTICS_DAILY` | 5,400 | 30 days per menu item. |

## Japanese Data Scope

The user-facing seed text is Japanese across restaurant names, restaurant descriptions, addresses, menu categories, menu item names, menu descriptions, ingredients, request templates, reviews, blog posts, comments, badges, features, payment method names, promotion copy, and moderation reasons.

The restaurant set is concentrated around Hanoi University of Science and Technology, including Dai Co Viet, Ta Quang Buu, Tran Dai Nghia, Bach Mai, Minh Khai, Giai Phong, Kim Lien, and nearby Hai Ba Trung/Dong Da streets.

Discount campaign coverage includes every campaign value allowed by `database/inits.sql`: `10%`, `20%`, `50%`, `100%`, `50000VND`, `100000VND`, and `200000VND`.

Schema-controlled enum values such as `Role`, `Status`, `MediaType`, `PromotionType`, and `AdvertisementType` remain in their required English values because `database/inits.sql` enforces those values with `CHECK` constraints.

## Image URL Coverage

| Area | Source |
|---|---|
| Restaurant media | `https://images.unsplash.com/...` |
| Menu item images | `https://images.unsplash.com/...` |
| Blog media | `https://images.unsplash.com/...` |
| Promotion media | `https://images.unsplash.com/...` |
| Avatar images | `https://randomuser.me/...` |
| Verification documents | `https://www.w3.org/.../dummy.pdf` |

## Validation Performed

| Check | Result |
|---|---|
| Generated SQL created successfully | Passed |
| Insert columns compared with `database/inits.sql` | Passed, no unknown columns |
| Tables covered by inserts | 35/35 |
| Active reservation duplicate table slots | 0 duplicates |
| Promotion redemption restaurant FK pairing | 0 invalid rows |
| Removed legacy menu columns | No `spicylevel` or `corianderlevel` columns generated |

## How To Regenerate

```powershell
cd D:\tabelink
python database\seeds\generate_mock_sql.py --output database\seeds\mock_data.sql
```

With destructive reset:

```powershell
cd D:\tabelink
python database\seeds\generate_mock_sql.py --truncate --output database\seeds\mock_data.sql
```

Run against Neon without `psql`:

```powershell
cd D:\tabelink\backend
node scripts\run-sql.js ..\database\seeds\mock_data.sql
```
