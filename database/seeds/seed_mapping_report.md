# Tabelink Mock Seed Mapping Report

Generated for:

- Schema source: `database/inits.sql`
- Seed generator: `database/seeds/generate_mock_sql.py`
- Generated SQL: `database/seeds/mock_data.sql`
- Common mock password: `Password123!`
- Stored password format: bcrypt hash in `USER_ACCOUNT.PasswordHash`

## Executive Summary

| Metric | Result |
|---|---:|
| Tables in schema | 28 |
| Tables covered by seed generator | 28 |
| Missing tables | 0 |
| Extra tables not in schema | 0 |
| Schema columns covered in generated seed rows | 100% |
| Main account count | 100 |
| Restaurant count | 15 |
| Menu item count | 270 |
| Reservation count | 800 |
| Review count | 400 |
| Restaurant analytics rows | 1,350 |
| Menu item analytics rows | 24,300 |
| Moderation log rows | 150 |

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

The password value is not stored as plain text. The generator stores a bcrypt hash that the backend auth flow can compare with `Password123!`.

## Table Coverage

| Table | Seed Rows | Columns Mapped | Missing Columns |
|---|---:|---:|---|
| `USER_ACCOUNT` | 100 | 7/7 | None |
| `FEATURE_MASTER` | 4 | 4/4 | None |
| `PAYMENT_METHOD` | 4 | 3/3 | None |
| `HASHTAG` | 5 | 2/2 | None |
| `SPECIAL_REQUEST_TEMPLATE` | 4 | 4/4 | None |
| `BADGE_MASTER` | 2 | 7/7 | None |
| `CUSTOMER_PROFILE` | 75 | 8/8 | None |
| `OWNER_PROFILE` | 20 | 5/5 | None |
| `USER_FOLLOW` | 75 | 3/3 | None |
| `MODERATION_LOG` | 150 | 7/7 | None |
| `RESTAURANT` | 15 | 15/15 | None |
| `RESTAURANT_MEDIA` | 45 | 6/6 | None |
| `RESTAURANT_FEATURE` | 50 | 2/2 | None |
| `RESTAURANT_PAYMENT_METHOD` | 45 | 2/2 | None |
| `MENU_ITEM` | 270 | 17/17 | None |
| `MENU_ITEM_CRITERION` | 540 | 6/6 | None |
| `RESTAURANT_TABLE` | 90 | 10/10 | None |
| `RESERVATION` | 800 | 11/11 | None |
| `RESERVATION_ITEM` | 1,599 | 8/8 | None |
| `RESERVATION_SPECIAL_REQUEST` | 480 | 4/4 | None |
| `REVIEW` | 400 | 13/13 | None |
| `REVIEW_MEDIA` | 200 | 5/5 | None |
| `REVIEW_TAG` | 800 | 2/2 | None |
| `PROMOTION` | 15 | 19/19 | None |
| `BADGE_APPLICATION` | 15 | 13/13 | None |
| `RESTAURANT_BADGE` | 15 | 5/5 | None |
| `RESTAURANT_ANALYTICS_DAILY` | 1,350 | 8/8 | None |
| `MENU_ITEM_ANALYTICS_DAILY` | 24,300 | 5/5 | None |

## Missing Tables

None. Every `CREATE TABLE` in `database/inits.sql` is represented by the generator.

## Missing Schema Columns

None. Every physical column declared in `database/inits.sql` is present in the generated rows for that table.

Notes:

- Generated SQL uses explicit IDs for deterministic foreign-key references.
- Generated SQL advances identity sequences with `setval(...)` after inserts.
- Default/trigger behavior is not required for seed correctness because all required columns are explicitly populated.
- `UpdatedAt` columns are explicitly seeded where present, even though the schema also has update triggers.

## Constraint Coverage

| Constraint Area | Coverage |
|---|---|
| Account roles | Covers `Admin`, `Owner`, `User`. |
| Account statuses | Covers `Active`, `Pending`, `Banned`. `Disabled` is not currently represented. |
| Restaurant statuses | Covers `Active`, `PendingApproval`. `Draft` and `Suspended` are not currently represented. |
| Restaurant coordinates | Latitude/longitude values are inside valid ranges. |
| Restaurant owner FK | Every restaurant points to an owner profile. |
| Media type/status | Covers `Cover`, `Photo`, `Approved`, `Pending`. `Other` and `Rejected` are not currently represented. |
| Menu price | All prices are non-negative. |
| Spicy/coriander levels | Values vary from 0 to 5. |
| Menu criterion rating | Values stay between 1 and 5. |
| Table capacity | All capacities are positive. |
| Table status | Covers `Empty`, `Using`, `Reserved`. |
| Reservation status | Covers `Pending`, `Confirmed`, `Arrived`, `Completed`, `Cancelled`. |
| Reservation duration | Every reservation has `DurationMinutes = 120`, so the default booking length is 2 hours. |
| Active reservation uniqueness | Active table time slots avoid 2-hour overlap for `Pending`, `Confirmed`, and `Arrived` through backend service validation. |
| Reservation items | All quantities are positive and item/restaurant pairs are valid. |
| Special requests | Covers template-based and custom-text requests. |
| Reviews | Ratings and cleanliness scores stay between 1 and 5. |
| Review status | Covers `Visible`, `Hidden`. `Deleted` is not currently represented. |
| Promotion status | Covers `Active`, `Pending`. `Rejected` and `Ended` are not currently represented. |
| Promotion approval rule | Every `Active` promotion has `ApprovedByAdminID`. |
| Badge application status | Covers `Approved`, `Pending`. `Rejected` is not currently represented. |
| Badge application approval rule | Every `Approved` application has reviewer and reviewed timestamp. |
| Analytics counts | Counts are non-negative, and Japanese visits never exceed total visits. |
| Peak hour | Values are inside 0-23. |

## Functional Area Mapping

| Functional Area | Main Tables | Seed Coverage |
|---|---|---|
| Authentication and roles | `USER_ACCOUNT`, `CUSTOMER_PROFILE`, `OWNER_PROFILE` | 100 accounts with bcrypt login password, role/status variation. |
| Owner restaurant management | `RESTAURANT`, `RESTAURANT_MEDIA`, `RESTAURANT_FEATURE`, `RESTAURANT_PAYMENT_METHOD` | 15 restaurants, media, features, and payment methods. |
| Menu management | `MENU_ITEM`, `MENU_ITEM_CRITERION`, `MENU_ITEM_ANALYTICS_DAILY` | 270 menu items, 540 criteria, 90 days of item analytics. |
| Feature ID 15 / Screen ID12 table management | `RESTAURANT_TABLE`, `RESERVATION`, `RESERVATION_ITEM`, `RESERVATION_SPECIAL_REQUEST` | 90 tables, 800 reservations, 1,599 pre-order items, 480 special requests. |
| Review and social | `REVIEW`, `REVIEW_MEDIA`, `REVIEW_TAG`, `HASHTAG`, `USER_FOLLOW` | 400 reviews, 200 media rows, 800 tags, 75 follows. |
| Promotion | `PROMOTION` | 15 promotions with valid approval rules. |
| Verification and badges | `BADGE_MASTER`, `BADGE_APPLICATION`, `RESTAURANT_BADGE` | 2 badge types, 15 applications, 15 granted badges. |
| Admin moderation/audit | `MODERATION_LOG` | 150 audit log rows. |
| Restaurant analytics | `RESTAURANT_ANALYTICS_DAILY` | 90 days per restaurant, 1,350 rows total. |

## Current Gaps By Data Variety

These are not schema gaps. They are optional data-variety gaps that may be useful for UI edge-case testing later.

| Area | Current Gap | Suggested Improvement |
|---|---|---|
| Account status | `Disabled` is not represented. | Add a small number of disabled users for admin filtering tests. |
| Restaurant status | `Draft` and `Suspended` are not represented. | Add 1-2 restaurants for each missing status. |
| Restaurant media | `Other` media type and `Rejected` status are not represented. | Add rejected media and non-cover/non-photo media rows. |
| Review status | `Deleted` is not represented. | Add deleted reviews to test moderation/history UI. |
| Promotion status | `Rejected` and `Ended` are not represented. | Add ended/rejected campaigns for owner campaign history. |
| Badge application status | `Rejected` is not represented. | Add rejected badge applications with review notes. |
| Moderation target IDs | Some log target IDs are synthetic and not guaranteed to point to existing target rows. | If strict clickable audit trail is needed, generate logs directly from real inserted target IDs. |
| Image/file URLs | URLs are mock URLs, not real Cloudinary assets. | Use real test assets only if visual rendering requires it. |
| Passwords | All accounts share one password by design. | Good for QA; do not use this seed in production. |

## Seed Size Versus Requested Sweet Spot

| Group | Requested Sweet Spot | Current Seed | Status |
|---|---:|---:|---|
| Accounts | 50-100 | 100 | At upper bound |
| Restaurants | 10-20 | 15 | In range |
| Menu items | 200-300 | 270 | In range |
| Reservations | 500-1,000 | 800 | In range |
| Reviews | 300-500 | 400 | In range |
| Analytics | 90 days | 90 days per restaurant and per menu item | Covered |
| Logs | 100-200 | 150 | In range |

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
