#!/usr/bin/env python3
"""
Generate deterministic mock SQL for the Tabelink PostgreSQL schema.

The generated SQL is designed for Neon/PostgreSQL and follows the constraints in
database/inits.sql: foreign keys are inserted in dependency order, enum/check
values are valid, active reservation table time-slots do not collide, and
identity sequences are advanced after explicit IDs are inserted.

Usage:
  python database/seeds/generate_mock_sql.py
  python database/seeds/generate_mock_sql.py --output database/seeds/mock_data.sql
  python database/seeds/generate_mock_sql.py --truncate --output database/seeds/mock_data.sql
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "database" / "seeds" / "mock_data.sql"


@dataclass(frozen=True)
class RawSql:
    value: str


Row = dict[str, object]


def q(value: object) -> str:
    if isinstance(value, RawSql):
        return value.value
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, float):
        return f"{value:.2f}"
    if isinstance(value, datetime):
        return "'" + value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z") + "'"
    if isinstance(value, date):
        return "'" + value.isoformat() + "'"

    text = str(value).replace("'", "''")
    return f"'{text}'"


def quote_ident(name: str) -> str:
    return name.lower()


def insert_sql(
    table: str,
    rows: Iterable[Row],
    conflict_columns: list[str],
    update_columns: list[str] | None = None,
) -> str:
    rows = list(rows)
    if not rows:
        return ""

    columns = list(rows[0].keys())
    for row in rows:
        if list(row.keys()) != columns:
            raise ValueError(f"Inconsistent columns for {table}")

    column_sql = ", ".join(quote_ident(column) for column in columns)
    values_sql = ",\n  ".join(
        "(" + ", ".join(q(row[column]) for column in columns) + ")" for row in rows
    )
    conflict_sql = ", ".join(quote_ident(column) for column in conflict_columns)

    if update_columns is None:
        update_columns = [
            column for column in columns if column not in set(conflict_columns)
        ]

    if update_columns:
        action_sql = "DO UPDATE SET " + ", ".join(
            f"{quote_ident(column)} = EXCLUDED.{quote_ident(column)}"
            for column in update_columns
        )
    else:
        action_sql = "DO NOTHING"

    return (
        f"INSERT INTO {quote_ident(table)} ({column_sql}) VALUES\n"
        f"  {values_sql}\n"
        f"ON CONFLICT ({conflict_sql}) {action_sql};"
    )


def sequence_sql(table: str, column: str) -> str:
    table_name = quote_ident(table)
    column_name = quote_ident(column)
    return (
        "SELECT setval(\n"
        f"  pg_get_serial_sequence('{table_name}', '{column_name}'),\n"
        f"  GREATEST((SELECT COALESCE(MAX({column_name}), 1) FROM {table_name}), 1),\n"
        "  TRUE\n"
        ");"
    )


def build_rows() -> list[tuple[str, list[Row], list[str], list[str] | None]]:
    utc = timezone.utc

    user_accounts = [
        {
            "accountid": 1,
            "email": "admin@tabelink.test",
            "passwordhash": "$2b$10$mockAdminPasswordHash",
            "role": "Admin",
            "status": "Active",
            "createdat": datetime(2026, 5, 1, 1, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 1, 1, 0, tzinfo=utc),
        },
        {
            "accountid": 101,
            "email": "owner.saigon@tabelink.test",
            "passwordhash": "$2b$10$mockOwnerSaigonPasswordHash",
            "role": "Owner",
            "status": "Active",
            "createdat": datetime(2026, 5, 1, 2, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 1, 2, 0, tzinfo=utc),
        },
        {
            "accountid": 102,
            "email": "owner.hanoi@tabelink.test",
            "passwordhash": "$2b$10$mockOwnerHanoiPasswordHash",
            "role": "Owner",
            "status": "Active",
            "createdat": datetime(2026, 5, 1, 2, 15, tzinfo=utc),
            "updatedat": datetime(2026, 5, 1, 2, 15, tzinfo=utc),
        },
        {
            "accountid": 201,
            "email": "sato.customer@tabelink.test",
            "passwordhash": "$2b$10$mockSatoPasswordHash",
            "role": "User",
            "status": "Active",
            "createdat": datetime(2026, 5, 2, 3, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 2, 3, 0, tzinfo=utc),
        },
        {
            "accountid": 202,
            "email": "tanaka.customer@tabelink.test",
            "passwordhash": "$2b$10$mockTanakaPasswordHash",
            "role": "User",
            "status": "Active",
            "createdat": datetime(2026, 5, 2, 3, 15, tzinfo=utc),
            "updatedat": datetime(2026, 5, 2, 3, 15, tzinfo=utc),
        },
        {
            "accountid": 203,
            "email": "linh.customer@tabelink.test",
            "passwordhash": "$2b$10$mockLinhPasswordHash",
            "role": "User",
            "status": "Pending",
            "createdat": datetime(2026, 5, 2, 3, 30, tzinfo=utc),
            "updatedat": datetime(2026, 5, 2, 3, 30, tzinfo=utc),
        },
    ]

    feature_master = [
        {
            "featureid": 1,
            "featurecode": "TABLE_MANAGEMENT",
            "featurenamevn": "Quản lý bàn",
            "featurenamejp": "席管理",
        },
        {
            "featureid": 2,
            "featurecode": "ONLINE_RESERVATION",
            "featurenamevn": "Đặt bàn trực tuyến",
            "featurenamejp": "オンライン予約",
        },
        {
            "featureid": 3,
            "featurecode": "JAPANESE_MENU",
            "featurenamevn": "Thực đơn tiếng Nhật",
            "featurenamejp": "日本語メニュー",
        },
        {
            "featureid": 4,
            "featurecode": "VAT_INVOICE",
            "featurenamevn": "Xuất hóa đơn VAT",
            "featurenamejp": "VAT領収書",
        },
    ]

    payment_methods = [
        {"paymentmethodid": 1, "methodcode": "CASH", "methodname": "Tiền mặt"},
        {"paymentmethodid": 2, "methodcode": "CARD", "methodname": "Thẻ"},
        {"paymentmethodid": 3, "methodcode": "MOMO", "methodname": "MoMo"},
        {"paymentmethodid": 4, "methodcode": "PAYPAY", "methodname": "PayPay"},
    ]

    hashtags = [
        {"tagid": 1, "name": "pho"},
        {"tagid": 2, "name": "comtam"},
        {"tagid": 3, "name": "japanese-friendly"},
        {"tagid": 4, "name": "clean"},
        {"tagid": 5, "name": "family"},
    ]

    request_templates = [
        {
            "templateid": 1,
            "textvn": "Không rau mùi",
            "textjp": "パクチー抜き",
            "requesttype": "Coriander",
        },
        {
            "templateid": 2,
            "textvn": "Ít cay",
            "textjp": "辛さ控えめ",
            "requesttype": "LessSpicy",
        },
        {
            "templateid": 3,
            "textvn": "Cần hóa đơn VAT",
            "textjp": "VAT領収書が必要",
            "requesttype": "VATInvoice",
        },
        {
            "templateid": 4,
            "textvn": "Ghế trẻ em nếu có",
            "textjp": "子ども椅子希望",
            "requesttype": "Other",
        },
    ]

    badges = [
        {
            "badgeid": 1,
            "badgecode": "VERIFIED",
            "badgenamevn": "Đã xác thực",
            "badgenamejp": "認証済み",
            "descriptionvn": "Nhà hàng đã được TABELINK xác thực hồ sơ.",
            "descriptionjp": "提出書類の確認後、TABELINKにより認証された店舗です。",
            "criteria": "Giấy phép kinh doanh, chứng nhận an toàn thực phẩm",
        },
        {
            "badgeid": 2,
            "badgecode": "JP_FRIENDLY",
            "badgenamevn": "Thân thiện với khách Nhật",
            "badgenamejp": "日本人向け",
            "descriptionvn": "Có thông tin, thực đơn hoặc hỗ trợ phù hợp khách Nhật.",
            "descriptionjp": "日本人利用者向けの情報やメニューがあります。",
            "criteria": "Thực đơn Nhật, nhân viên hỗ trợ, đánh giá tốt",
        },
    ]

    customer_profiles = [
        {
            "accountid": 201,
            "fullname": "Sato Haruka",
            "displayname": "Haruka",
            "gender": "Female",
            "dob": date(1994, 4, 12),
            "nationality": "Japan",
            "purpose": "Business lunch and local food discovery",
            "avatarurl": "https://images.example.test/avatars/sato.jpg",
        },
        {
            "accountid": 202,
            "fullname": "Tanaka Ren",
            "displayname": "Ren",
            "gender": "Male",
            "dob": date(1990, 9, 5),
            "nationality": "Japan",
            "purpose": "Family dining",
            "avatarurl": "https://images.example.test/avatars/tanaka.jpg",
        },
        {
            "accountid": 203,
            "fullname": "Nguyen Linh",
            "displayname": "Linh",
            "gender": "Female",
            "dob": date(1998, 2, 20),
            "nationality": "Vietnam",
            "purpose": "Review Vietnamese restaurants",
            "avatarurl": None,
        },
    ]

    owner_profiles = [
        {
            "accountid": 101,
            "fullname": "Tran Minh",
            "phone": "+84901234567",
            "businessname": "Saigon Pho Group",
            "avatarurl": "https://images.example.test/owners/saigon.jpg",
        },
        {
            "accountid": 102,
            "fullname": "Pham Anh",
            "phone": "+84987654321",
            "businessname": "Hanoi Home Kitchen",
            "avatarurl": "https://images.example.test/owners/hanoi.jpg",
        },
    ]

    follows = [
        {
            "followeraccountid": 201,
            "followedaccountid": 202,
            "createdat": datetime(2026, 5, 3, 4, 0, tzinfo=utc),
        },
        {
            "followeraccountid": 202,
            "followedaccountid": 201,
            "createdat": datetime(2026, 5, 3, 4, 10, tzinfo=utc),
        },
        {
            "followeraccountid": 203,
            "followedaccountid": 201,
            "createdat": datetime(2026, 5, 3, 4, 20, tzinfo=utc),
        },
    ]

    restaurants = [
        {
            "restaurantid": 1001,
            "owneraccountid": 101,
            "namevn": "Phở Sài Gòn 1985",
            "namejp": "サイゴンフォー1985",
            "address": "12 Nguyen Hue, District 1, Ho Chi Minh City",
            "latitude": Decimal("10.775843"),
            "longitude": Decimal("106.701755"),
            "descriptionvn": "Quán phở trung tâm, có menu tiếng Nhật và đặt bàn.",
            "descriptionjp": "市内中心部のフォー店。日本語メニューと予約に対応。",
            "issuesvat": True,
            "phone": "+842812345678",
            "openinghours": "10:00-22:00",
            "status": "Active",
            "createdat": datetime(2026, 5, 3, 5, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 3, 5, 0, tzinfo=utc),
        },
        {
            "restaurantid": 1002,
            "owneraccountid": 102,
            "namevn": "Bếp Nhà Hà Nội",
            "namejp": "ハノイ家庭料理",
            "address": "25 Hang Be, Hoan Kiem, Hanoi",
            "latitude": Decimal("21.034210"),
            "longitude": Decimal("105.853020"),
            "descriptionvn": "Món gia đình miền Bắc, không gian yên tĩnh.",
            "descriptionjp": "北部家庭料理。落ち着いた空間です。",
            "issuesvat": False,
            "phone": "+842412345678",
            "openinghours": "09:30-21:30",
            "status": "PendingApproval",
            "createdat": datetime(2026, 5, 3, 5, 30, tzinfo=utc),
            "updatedat": datetime(2026, 5, 3, 5, 30, tzinfo=utc),
        },
    ]

    restaurant_media = [
        {
            "mediaid": 1,
            "restaurantid": 1001,
            "mediaurl": "https://images.example.test/restaurants/1001/cover.jpg",
            "mediatype": "Cover",
            "sortorder": 0,
            "status": "Approved",
        },
        {
            "mediaid": 2,
            "restaurantid": 1001,
            "mediaurl": "https://images.example.test/restaurants/1001/dining-room.jpg",
            "mediatype": "Photo",
            "sortorder": 1,
            "status": "Approved",
        },
        {
            "mediaid": 3,
            "restaurantid": 1002,
            "mediaurl": "https://images.example.test/restaurants/1002/cover.jpg",
            "mediatype": "Cover",
            "sortorder": 0,
            "status": "Pending",
        },
    ]

    restaurant_features = [
        {"restaurantid": 1001, "featureid": 1},
        {"restaurantid": 1001, "featureid": 2},
        {"restaurantid": 1001, "featureid": 3},
        {"restaurantid": 1001, "featureid": 4},
        {"restaurantid": 1002, "featureid": 1},
        {"restaurantid": 1002, "featureid": 3},
    ]

    restaurant_payment_methods = [
        {"restaurantid": 1001, "paymentmethodid": 1},
        {"restaurantid": 1001, "paymentmethodid": 2},
        {"restaurantid": 1001, "paymentmethodid": 3},
        {"restaurantid": 1002, "paymentmethodid": 1},
        {"restaurantid": 1002, "paymentmethodid": 4},
    ]

    menu_items = [
        {
            "itemid": 5001,
            "restaurantid": 1001,
            "namevn": "Phở bò tái",
            "namejp": "半生牛肉フォー",
            "price": Decimal("85000.00"),
            "descriptionvn": "Nước dùng bò thanh, bánh phở mềm.",
            "descriptionjp": "あっさりした牛骨スープのフォー。",
            "ingredients": "Bánh phở, thịt bò, hành, rau thơm",
            "isrecommendedforjp": True,
            "spicylevel": 1,
            "corianderlevel": 2,
            "imageurl": "https://images.example.test/menu/pho-bo-tai.jpg",
            "imagepublicid": "tabelink/restaurants/1001/menus/pho-bo-tai",
            "isactive": True,
            "deletedat": None,
            "createdat": datetime(2026, 5, 3, 6, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 3, 6, 0, tzinfo=utc),
        },
        {
            "itemid": 5002,
            "restaurantid": 1001,
            "namevn": "Gỏi cuốn tôm thịt",
            "namejp": "海老と豚肉の生春巻き",
            "price": Decimal("65000.00"),
            "descriptionvn": "Cuốn tươi ăn kèm nước chấm đậu phộng.",
            "descriptionjp": "ピーナッツソース付きの生春巻き。",
            "ingredients": "Bánh tráng, tôm, thịt heo, rau sống",
            "isrecommendedforjp": True,
            "spicylevel": 0,
            "corianderlevel": 1,
            "imageurl": "https://images.example.test/menu/goi-cuon.jpg",
            "imagepublicid": "tabelink/restaurants/1001/menus/goi-cuon",
            "isactive": True,
            "deletedat": None,
            "createdat": datetime(2026, 5, 3, 6, 10, tzinfo=utc),
            "updatedat": datetime(2026, 5, 3, 6, 10, tzinfo=utc),
        },
        {
            "itemid": 5003,
            "restaurantid": 1002,
            "namevn": "Bún chả Hà Nội",
            "namejp": "ハノイ風ブンチャー",
            "price": Decimal("90000.00"),
            "descriptionvn": "Thịt nướng ăn cùng bún và nước chấm.",
            "descriptionjp": "焼き豚と米麺を甘酸っぱいタレで楽しむ料理。",
            "ingredients": "Bún, thịt heo, rau sống, nước mắm",
            "isrecommendedforjp": True,
            "spicylevel": 1,
            "corianderlevel": 2,
            "imageurl": "https://images.example.test/menu/bun-cha.jpg",
            "imagepublicid": "tabelink/restaurants/1002/menus/bun-cha",
            "isactive": True,
            "deletedat": None,
            "createdat": datetime(2026, 5, 3, 6, 20, tzinfo=utc),
            "updatedat": datetime(2026, 5, 3, 6, 20, tzinfo=utc),
        },
    ]

    menu_item_criteria = [
        {"criterionid": 1, "itemid": 5001, "criterionname": "Hương vị", "ratinglevel": 5, "sortorder": 0, "createdat": datetime(2026, 5, 3, 6, 30, tzinfo=utc)},
        {"criterionid": 2, "itemid": 5001, "criterionname": "Độ cay", "ratinglevel": 1, "sortorder": 1, "createdat": datetime(2026, 5, 3, 6, 31, tzinfo=utc)},
        {"criterionid": 3, "itemid": 5002, "criterionname": "Độ tươi", "ratinglevel": 5, "sortorder": 0, "createdat": datetime(2026, 5, 3, 6, 32, tzinfo=utc)},
        {"criterionid": 4, "itemid": 5003, "criterionname": "Hương than", "ratinglevel": 4, "sortorder": 0, "createdat": datetime(2026, 5, 3, 6, 33, tzinfo=utc)},
    ]

    restaurant_tables = [
        {"tableid": 7001, "restaurantid": 1001, "tablename": "A1", "capacity": 2, "status": "Reserved", "positionx": Decimal("40.00"), "positiony": Decimal("50.00"), "width": Decimal("80.00"), "height": Decimal("80.00"), "zone": "Floor 1"},
        {"tableid": 7002, "restaurantid": 1001, "tablename": "A2", "capacity": 4, "status": "Using", "positionx": Decimal("150.00"), "positiony": Decimal("50.00"), "width": Decimal("100.00"), "height": Decimal("80.00"), "zone": "Floor 1"},
        {"tableid": 7003, "restaurantid": 1001, "tablename": "B1", "capacity": 6, "status": "Empty", "positionx": Decimal("40.00"), "positiony": Decimal("170.00"), "width": Decimal("140.00"), "height": Decimal("90.00"), "zone": "Floor 2"},
        {"tableid": 7004, "restaurantid": 1001, "tablename": "B2", "capacity": 4, "status": "Reserved", "positionx": Decimal("210.00"), "positiony": Decimal("170.00"), "width": Decimal("100.00"), "height": Decimal("80.00"), "zone": "Floor 2"},
        {"tableid": 7101, "restaurantid": 1002, "tablename": "H1", "capacity": 4, "status": "Empty", "positionx": Decimal("50.00"), "positiony": Decimal("60.00"), "width": Decimal("100.00"), "height": Decimal("80.00"), "zone": "Main"},
        {"tableid": 7102, "restaurantid": 1002, "tablename": "H2", "capacity": 2, "status": "Reserved", "positionx": Decimal("180.00"), "positiony": Decimal("60.00"), "width": Decimal("80.00"), "height": Decimal("80.00"), "zone": "Main"},
    ]

    reservations = [
        {
            "reservationid": 9001,
            "customeraccountid": 201,
            "restaurantid": 1001,
            "tableid": 7001,
            "reservationdatetime": datetime(2026, 5, 10, 12, 0, tzinfo=utc),
            "pax": 2,
            "note": "No coriander, please.",
            "status": "Approved",
            "createdat": datetime(2026, 5, 4, 1, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 4, 1, 15, tzinfo=utc),
        },
        {
            "reservationid": 9002,
            "customeraccountid": 202,
            "restaurantid": 1001,
            "tableid": 7003,
            "reservationdatetime": datetime(2026, 5, 10, 18, 30, tzinfo=utc),
            "pax": 4,
            "note": "Family dinner.",
            "status": "Pending",
            "createdat": datetime(2026, 5, 4, 2, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 4, 2, 0, tzinfo=utc),
        },
        {
            "reservationid": 9003,
            "customeraccountid": 201,
            "restaurantid": 1001,
            "tableid": 7002,
            "reservationdatetime": datetime(2026, 5, 5, 12, 0, tzinfo=utc),
            "pax": 2,
            "note": "Completed lunch reservation.",
            "status": "Completed",
            "createdat": datetime(2026, 5, 4, 3, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 5, 13, 0, tzinfo=utc),
        },
        {
            "reservationid": 9004,
            "customeraccountid": 203,
            "restaurantid": 1002,
            "tableid": 7102,
            "reservationdatetime": datetime(2026, 5, 11, 11, 30, tzinfo=utc),
            "pax": 2,
            "note": "Quiet table.",
            "status": "Approved",
            "createdat": datetime(2026, 5, 4, 4, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 4, 4, 15, tzinfo=utc),
        },
        {
            "reservationid": 9005,
            "customeraccountid": 202,
            "restaurantid": 1002,
            "tableid": None,
            "reservationdatetime": datetime(2026, 5, 12, 19, 0, tzinfo=utc),
            "pax": 3,
            "note": "Cancelled by customer.",
            "status": "Cancelled",
            "createdat": datetime(2026, 5, 4, 5, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 4, 5, 30, tzinfo=utc),
        },
    ]

    reservation_items = [
        {"reservationitemid": 1, "reservationid": 9001, "restaurantid": 1001, "itemid": 5001, "quantity": 2, "unitprice": Decimal("85000.00"), "note": "No coriander", "createdat": datetime(2026, 5, 4, 1, 5, tzinfo=utc)},
        {"reservationitemid": 2, "reservationid": 9001, "restaurantid": 1001, "itemid": 5002, "quantity": 1, "unitprice": Decimal("65000.00"), "note": None, "createdat": datetime(2026, 5, 4, 1, 6, tzinfo=utc)},
        {"reservationitemid": 3, "reservationid": 9003, "restaurantid": 1001, "itemid": 5001, "quantity": 1, "unitprice": Decimal("85000.00"), "note": None, "createdat": datetime(2026, 5, 4, 3, 5, tzinfo=utc)},
        {"reservationitemid": 4, "reservationid": 9004, "restaurantid": 1002, "itemid": 5003, "quantity": 2, "unitprice": Decimal("90000.00"), "note": "Less spicy", "createdat": datetime(2026, 5, 4, 4, 5, tzinfo=utc)},
    ]

    reservation_special_requests = [
        {"requestid": 1, "reservationid": 9001, "templateid": 1, "customtext": None},
        {"requestid": 2, "reservationid": 9001, "templateid": 2, "customtext": None},
        {"requestid": 3, "reservationid": 9002, "templateid": 4, "customtext": "Please prepare a child chair."},
        {"requestid": 4, "reservationid": 9005, "templateid": None, "customtext": "Customer will rebook next week."},
    ]

    reviews = [
        {
            "reviewid": 3001,
            "customeraccountid": 201,
            "restaurantid": 1001,
            "reservationid": 9003,
            "rating": 5,
            "toiletcleanliness": 4,
            "dishcleanliness": 5,
            "spacecleanliness": 4,
            "content": "Good pho and clear Japanese menu.",
            "isjapanesetag": True,
            "status": "Visible",
            "createdat": datetime(2026, 5, 5, 14, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 5, 14, 0, tzinfo=utc),
        }
    ]

    blog_posts = [
        {
            "blogid": 4001,
            "customeraccountid": 201,
            "restaurantid": 1001,
            "title": "Lunch near Hoan Kiem",
            "content": "Clean space, easy booking, and a clear Japanese menu.",
            "status": "Published",
            "createdat": datetime(2026, 5, 5, 15, 0, tzinfo=utc),
            "updatedat": datetime(2026, 5, 5, 15, 0, tzinfo=utc),
        }
    ]

    blog_media = [
        {"mediaid": 1, "blogid": 4001, "mediaurl": "https://images.example.test/blogs/4001/pho.jpg", "mediatype": "Photo", "sortorder": 0}
    ]

    blog_tags = [
        {"blogid": 4001, "tagid": 1},
        {"blogid": 4001, "tagid": 3},
        {"blogid": 4001, "tagid": 4},
    ]

    blog_likes = [
        {"blogid": 4001, "customeraccountid": 202, "createdat": datetime(2026, 5, 5, 16, 0, tzinfo=utc)}
    ]

    blog_comments = [
        {
            "commentid": 1,
            "blogid": 4001,
            "customeraccountid": 202,
            "parentcommentid": None,
            "content": "Useful note for lunch.",
            "status": "Visible",
            "createdat": datetime(2026, 5, 5, 16, 5, tzinfo=utc),
            "updatedat": datetime(2026, 5, 5, 16, 5, tzinfo=utc),
        }
    ]

    blog_shares = [
        {"shareid": 1, "blogid": 4001, "customeraccountid": 202, "createdat": datetime(2026, 5, 5, 16, 10, tzinfo=utc)}
    ]

    promotions = [
        {
            "promotionid": 8001,
            "restaurantid": 1001,
            "createdbyowneraccountid": 101,
            "approvedbyadminid": 1,
            "promotiontype": "Campaign",
            "targetaudience": "Japanese office workers in District 1",
            "titlevn": "Combo trưa cho khách Nhật",
            "titlejp": "日本人向けランチセット",
            "contentvn": "Giảm 10% cho combo phở và gỏi cuốn.",
            "contentjp": "フォーと生春巻きセットを10%割引。",
            "mediaurl": "https://images.example.test/promotions/8001.jpg",
            "termsvn": "Áp dụng từ thứ Hai đến thứ Sáu.",
            "termsjp": "平日のみ適用。",
            "startdate": datetime(2026, 5, 6, 0, 0, tzinfo=utc),
            "enddate": datetime(2026, 6, 6, 0, 0, tzinfo=utc),
            "status": "Active",
            "impressions": 1200,
            "clicks": 180,
            "totalcost": Decimal("2500000.00"),
        },
        {
            "promotionid": 8002,
            "restaurantid": 1002,
            "createdbyowneraccountid": 102,
            "approvedbyadminid": None,
            "promotiontype": "Advertisement",
            "targetaudience": "Families visiting Hanoi",
            "titlevn": "Bữa tối gia đình",
            "titlejp": "家族向けディナー",
            "contentvn": "Set bún chả cho nhóm 4 người.",
            "contentjp": "4名向けブンチャーセット。",
            "mediaurl": "https://images.example.test/promotions/8002.jpg",
            "termsvn": "Chờ duyệt.",
            "termsjp": "承認待ち。",
            "startdate": datetime(2026, 5, 15, 0, 0, tzinfo=utc),
            "enddate": datetime(2026, 6, 15, 0, 0, tzinfo=utc),
            "status": "Pending",
            "impressions": 0,
            "clicks": 0,
            "totalcost": Decimal("0.00"),
        },
    ]

    badge_applications = [
        {
            "appid": 6001,
            "restaurantid": 1001,
            "badgeid": 1,
            "submittedbyowneraccountid": 101,
            "reviewedbyadminid": 1,
            "businesslicenseurl": "https://files.example.test/verification/1001/license.pdf",
            "businesslicensepublicid": "tabelink/restaurants/1001/verification/business-license/license",
            "foodsafetycerturl": "https://files.example.test/verification/1001/food-safety.pdf",
            "foodsafetycertpublicid": "tabelink/restaurants/1001/verification/food-safety/cert",
            "status": "Approved",
            "submittedat": datetime(2026, 5, 3, 7, 0, tzinfo=utc),
            "reviewedat": datetime(2026, 5, 3, 8, 0, tzinfo=utc),
            "reviewnote": "Documents are valid.",
        },
        {
            "appid": 6002,
            "restaurantid": 1002,
            "badgeid": 1,
            "submittedbyowneraccountid": 102,
            "reviewedbyadminid": None,
            "businesslicenseurl": "https://files.example.test/verification/1002/license.pdf",
            "businesslicensepublicid": "tabelink/restaurants/1002/verification/business-license/license",
            "foodsafetycerturl": None,
            "foodsafetycertpublicid": None,
            "status": "Pending",
            "submittedat": datetime(2026, 5, 4, 7, 0, tzinfo=utc),
            "reviewedat": None,
            "reviewnote": None,
        },
    ]

    restaurant_badges = [
        {
            "restaurantid": 1001,
            "badgeid": 1,
            "grantedbyadminid": 1,
            "grantedat": datetime(2026, 5, 3, 8, 5, tzinfo=utc),
            "expiresat": datetime(2027, 5, 3, 8, 5, tzinfo=utc),
        },
        {
            "restaurantid": 1001,
            "badgeid": 2,
            "grantedbyadminid": 1,
            "grantedat": datetime(2026, 5, 3, 8, 10, tzinfo=utc),
            "expiresat": None,
        },
    ]

    moderation_logs = [
        {"logid": 1, "adminaccountid": 1, "targettype": "BadgeApplication", "targetid": 6001, "actiontype": "Approve", "reason": "Documents verified.", "createdat": datetime(2026, 5, 3, 8, 0, tzinfo=utc)},
        {"logid": 2, "adminaccountid": 1, "targettype": "RestaurantMedia", "targetid": 1, "actiontype": "Approve", "reason": "Cover image approved.", "createdat": datetime(2026, 5, 3, 8, 20, tzinfo=utc)},
        {"logid": 3, "adminaccountid": 1, "targettype": "Promotion", "targetid": 8001, "actiontype": "Approve", "reason": "Campaign complies with policy.", "createdat": datetime(2026, 5, 6, 1, 0, tzinfo=utc)},
    ]

    restaurant_analytics = [
        {"analyticsid": 1, "restaurantid": 1001, "statdate": date(2026, 5, 5), "visitcount": 240, "japanesevisitcount": 85, "reviewcount": 1, "reservationcount": 3, "peakhour": 12},
        {"analyticsid": 2, "restaurantid": 1001, "statdate": date(2026, 5, 6), "visitcount": 210, "japanesevisitcount": 73, "reviewcount": 0, "reservationcount": 2, "peakhour": 19},
        {"analyticsid": 3, "restaurantid": 1002, "statdate": date(2026, 5, 5), "visitcount": 120, "japanesevisitcount": 26, "reviewcount": 0, "reservationcount": 1, "peakhour": 18},
    ]

    menu_analytics = [
        {"analyticsid": 1, "itemid": 5001, "statdate": date(2026, 5, 5), "viewcount": 180, "ordercount": 42},
        {"analyticsid": 2, "itemid": 5002, "statdate": date(2026, 5, 5), "viewcount": 95, "ordercount": 18},
        {"analyticsid": 3, "itemid": 5003, "statdate": date(2026, 5, 5), "viewcount": 70, "ordercount": 11},
    ]

    # Scale up to a realistic QA dataset. All mock accounts share this password:
    # Password123!
    password_hash = "$2b$10$BFWjs0HqgjGtmCJMWSvAKenKYyD/ZXGQ4z/whptnX.xeaqap6QzS2"
    base_created = datetime(2026, 5, 1, 1, 0, tzinfo=utc)
    base_reservation = datetime(2026, 5, 10, 10, 0, tzinfo=utc)

    user_accounts = []
    for account_id in range(1, 6):
        user_accounts.append(
            {
                "accountid": account_id,
                "email": f"admin{account_id}@tabelink.test",
                "passwordhash": password_hash,
                "role": "Admin",
                "status": "Active",
                "createdat": base_created,
                "updatedat": base_created,
            }
        )

    for offset, account_id in enumerate(range(101, 121), start=1):
        user_accounts.append(
            {
                "accountid": account_id,
                "email": f"owner{offset:02d}@tabelink.test",
                "passwordhash": password_hash,
                "role": "Owner",
                "status": "Active",
                "createdat": base_created,
                "updatedat": base_created,
            }
        )

    for offset, account_id in enumerate(range(201, 276), start=1):
        user_accounts.append(
            {
                "accountid": account_id,
                "email": f"user{offset:02d}@tabelink.test",
                "passwordhash": password_hash,
                "role": "User",
                "status": ["Active", "Active", "Active", "Pending", "Banned"][offset % 5],
                "createdat": base_created,
                "updatedat": base_created,
            }
        )

    owner_profiles = [
        {
            "accountid": account_id,
            "fullname": f"Owner {offset:02d}",
            "phone": f"+8490{offset:07d}",
            "businessname": f"Tabelink Mock Restaurant Group {offset:02d}",
            "avatarurl": f"https://images.example.test/owners/{account_id}.jpg",
        }
        for offset, account_id in enumerate(range(101, 121), start=1)
    ]

    customer_profiles = [
        {
            "accountid": account_id,
            "fullname": f"Mock Customer {offset:02d}",
            "displayname": f"Customer {offset:02d}",
            "gender": ["Female", "Male", "Other"][offset % 3],
            "dob": date(1988 + (offset % 16), (offset % 12) + 1, (offset % 27) + 1),
            "nationality": ["Japan", "Vietnam", "Korea", "Singapore"][offset % 4],
            "purpose": ["Business lunch", "Family dining", "Food discovery", "Date night"][offset % 4],
            "avatarurl": f"https://images.example.test/avatars/{account_id}.jpg",
        }
        for offset, account_id in enumerate(range(201, 276), start=1)
    ]

    follows = [
        {
            "followeraccountid": 201 + index,
            "followedaccountid": 201 + ((index + 7) % 75),
            "createdat": datetime(2026, 5, 3, index % 24, index % 60, tzinfo=utc),
        }
        for index in range(75)
        if index != ((index + 7) % 75)
    ]

    restaurant_names = [
        ("Phở Sài Gòn 1985", "サイゴンフォー1985", "Ho Chi Minh City"),
        ("Bếp Nhà Hà Nội", "ハノイ家庭料理", "Hanoi"),
        ("Cơm Tấm Tokyo Alley", "コムタム東京横丁", "Ho Chi Minh City"),
        ("Bún Chả Hồ Gươm", "ホーグオムブンチャー", "Hanoi"),
        ("Mì Quảng Hội An", "ホイアンミークアン", "Da Nang"),
        ("Chay An Nhiên", "アンニエン精進料理", "Ho Chi Minh City"),
        ("Lẩu Mắm Mekong", "メコン鍋", "Can Tho"),
        ("Bánh Mì Station", "バインミーステーション", "Ho Chi Minh City"),
        ("Hải Sản Biển Đông", "ビエンドン海鮮", "Da Nang"),
        ("Quán Huế Cố Đô", "古都フエ料理", "Hue"),
        ("Cà Phê & Cơm Việt", "ベトナムカフェ食堂", "Hanoi"),
        ("Nem Nướng Nha Trang", "ニャチャン焼き春巻き", "Nha Trang"),
        ("Ốc Đêm Sài Gòn", "サイゴン夜貝料理", "Ho Chi Minh City"),
        ("Gà Nướng Lá Chanh", "レモンリーフ焼き鶏", "Da Lat"),
        ("Tấm Cám Bistro", "タムカムビストロ", "Ho Chi Minh City"),
    ]
    city_coords = {
        "Ho Chi Minh City": (Decimal("10.775843"), Decimal("106.701755")),
        "Hanoi": (Decimal("21.034210"), Decimal("105.853020")),
        "Da Nang": (Decimal("16.054407"), Decimal("108.202167")),
        "Can Tho": (Decimal("10.045162"), Decimal("105.746857")),
        "Hue": (Decimal("16.463713"), Decimal("107.590866")),
        "Nha Trang": (Decimal("12.238791"), Decimal("109.196749")),
        "Da Lat": (Decimal("11.940419"), Decimal("108.458313")),
    }

    restaurants = []
    for index, (name_vn, name_jp, city) in enumerate(restaurant_names, start=1):
        latitude, longitude = city_coords[city]
        restaurants.append(
            {
                "restaurantid": 1000 + index,
                "owneraccountid": 100 + index,
                "namevn": name_vn,
                "namejp": name_jp,
                "address": f"{10 + index} Mock Street, {city}",
                "latitude": latitude + Decimal(index) / Decimal("10000"),
                "longitude": longitude + Decimal(index) / Decimal("10000"),
                "descriptionvn": f"{name_vn} có menu tiếng Nhật, đặt bàn và dữ liệu mock đầy đủ.",
                "descriptionjp": f"{name_jp} は日本語メニューと予約に対応しています。",
                "issuesvat": index % 3 != 0,
                "phone": f"+8428{index:08d}",
                "openinghours": ["09:00-21:00", "10:00-22:00", "11:00-23:00"][index % 3],
                "status": "Active" if index <= 13 else "PendingApproval",
                "createdat": base_created,
                "updatedat": base_created,
            }
        )

    restaurant_media = []
    media_id = 1
    for restaurant_row in restaurants:
        for sort_order, media_type in enumerate(["Cover", "Photo", "Photo"]):
            restaurant_media.append(
                {
                    "mediaid": media_id,
                    "restaurantid": restaurant_row["restaurantid"],
                    "mediaurl": f"https://images.example.test/restaurants/{restaurant_row['restaurantid']}/{sort_order}.jpg",
                    "mediatype": media_type,
                    "sortorder": sort_order,
                    "status": "Approved" if restaurant_row["status"] == "Active" else "Pending",
                }
            )
            media_id += 1

    restaurant_features = [
        {"restaurantid": restaurant_row["restaurantid"], "featureid": feature_id}
        for restaurant_row in restaurants
        for feature_id in ([1, 2, 3, 4] if restaurant_row["restaurantid"] % 3 else [1, 3])
    ]
    restaurant_payment_methods = [
        {"restaurantid": restaurant_row["restaurantid"], "paymentmethodid": payment_id}
        for restaurant_row in restaurants
        for payment_id in ([1, 2, 3] if restaurant_row["restaurantid"] % 2 else [1, 2, 4])
    ]

    menu_categories = []
    category_id = 1
    categories_by_restaurant: dict[int, list[int]] = {}
    for restaurant_row in restaurants:
        restaurant_id = int(restaurant_row["restaurantid"])
        categories_by_restaurant[restaurant_id] = []
        for i, (code, vn, jp) in enumerate([
            ("main", "Món chính", "メイン料理"),
            ("starter", "Khai vị", "スターター"),
            ("dessert", "Tráng miệng", "デザート"),
        ]):
            cat_id = category_id
            category_id += 1
            menu_categories.append({
                "categoryid": cat_id,
                "restaurantid": restaurant_id,
                "categorycode": code,
                "categorynamevn": vn,
                "categorynamejp": jp,
                "sortorder": i,
                "isactive": True
            })
            categories_by_restaurant[restaurant_id].append(cat_id)

    dish_names = [
        ("Phở bò", "牛肉フォー"),
        ("Gỏi cuốn", "生春巻き"),
        ("Bún chả", "ブンチャー"),
        ("Cơm tấm", "コムタム"),
        ("Bánh mì", "バインミー"),
        ("Mì Quảng", "ミークアン"),
        ("Bánh xèo", "バインセオ"),
        ("Chả giò", "揚げ春巻き"),
        ("Bún bò Huế", "フエ牛肉麺"),
        ("Cá kho tộ", "魚の土鍋煮"),
        ("Gà nướng", "焼き鶏"),
        ("Lẩu hải sản", "海鮮鍋"),
        ("Rau muống xào", "空芯菜炒め"),
        ("Chè đậu xanh", "緑豆チェー"),
        ("Cà phê sữa đá", "ベトナムアイスコーヒー"),
        ("Nem nướng", "焼き春巻き"),
        ("Ốc xào bơ", "貝のバター炒め"),
        ("Bò lúc lắc", "ベトナム風サイコロステーキ"),
    ]
    menu_items = []
    menu_item_criteria = []
    menu_items_by_restaurant: dict[int, list[int]] = {}
    item_id = 5001
    criterion_id = 1
    for restaurant_index, restaurant_row in enumerate(restaurants, start=1):
        restaurant_id = int(restaurant_row["restaurantid"])
        menu_items_by_restaurant[restaurant_id] = []
        for dish_index, (name_vn, name_jp) in enumerate(dish_names, start=1):
            current_item_id = item_id
            menu_items_by_restaurant[restaurant_id].append(current_item_id)
            price = Decimal(45000 + ((restaurant_index * dish_index) % 16) * 10000)
            cat_id = categories_by_restaurant[restaurant_id][dish_index % 3]
            menu_items.append(
                {
                    "itemid": current_item_id,
                    "restaurantid": restaurant_id,
                    "categoryid": cat_id,
                    "namevn": f"{name_vn} {restaurant_index:02d}",
                    "namejp": f"{name_jp} {restaurant_index:02d}",
                    "price": price,
                    "descriptionvn": f"Món {name_vn.lower()} mock cho nhà hàng {restaurant_index:02d}.",
                    "descriptionjp": f"{name_jp} のモックメニューです。",
                    "ingredients": "Gia vị Việt Nam, rau thơm, nguyên liệu tươi",
                    "isrecommendedforjp": dish_index % 3 != 0,
                    "imageurl": f"https://images.example.test/menu/{current_item_id}.jpg",
                    "imagepublicid": f"tabelink/restaurants/{restaurant_id}/menus/{current_item_id}",
                    "isactive": dish_index % 17 != 0,
                    "deletedat": None,
                    "createdat": base_created,
                    "updatedat": base_created,
                }
            )
            for criterion_name, rating_level, sort_order in [
                ("Hương vị", 3 + ((dish_index + restaurant_index) % 3), 0),
                ("Độ sạch", 3 + (dish_index % 3), 1),
            ]:
                menu_item_criteria.append(
                    {
                        "criterionid": criterion_id,
                        "itemid": current_item_id,
                        "criterionname": criterion_name,
                        "ratinglevel": rating_level,
                        "sortorder": sort_order,
                        "createdat": base_created,
                    }
                )
                criterion_id += 1
            item_id += 1

    table_capacities = [2, 2, 4, 4, 6, 8]
    restaurant_tables = []
    tables_by_restaurant: dict[int, list[dict[str, object]]] = {}
    table_id = 7001
    for restaurant_row in restaurants:
        restaurant_id = int(restaurant_row["restaurantid"])
        tables_by_restaurant[restaurant_id] = []
        for table_index, capacity in enumerate(table_capacities, start=1):
            status = ["Empty", "Using", "Reserved", "Empty", "Reserved", "Empty"][table_index - 1]
            table_row = {
                "tableid": table_id,
                "restaurantid": restaurant_id,
                "tablename": f"{chr(64 + table_index)}{restaurant_id - 1000}",
                "capacity": capacity,
                "status": status,
                "positionx": Decimal(40 + ((table_index - 1) % 3) * 120),
                "positiony": Decimal(50 + ((table_index - 1) // 3) * 120),
                "width": Decimal(80 + min(capacity, 6) * 10),
                "height": Decimal("80.00"),
                "zone": "Floor 1" if table_index <= 3 else "Floor 2",
            }
            restaurant_tables.append(table_row)
            tables_by_restaurant[restaurant_id].append(table_row)
            table_id += 1

    statuses = [
        "Pending",
        "Confirmed",
        "Arrived",
        "Completed",
        "Completed",
        "Cancelled",
        "Confirmed",
        "Arrived",
        "Confirmed",
    ]
    active_keys: set[tuple[int, int, datetime]] = set()
    reservations = []
    reservation_items = []
    reservation_special_requests = []
    for index in range(800):
        reservation_id = 9001 + index
        restaurant_row = restaurants[index % len(restaurants)]
        restaurant_id = int(restaurant_row["restaurantid"])
        status = statuses[index % len(statuses)]
        candidate_tables = [
            table_row
            for table_row in tables_by_restaurant[restaurant_id]
            if table_row["status"] != "Using"
        ]
        selected_table = candidate_tables[index % len(candidate_tables)]
        day_offset = index % 90
        slot = (index // 90) % 5
        reservation_time = base_reservation.replace(
            hour=[10, 12, 14, 18, 20][slot],
            minute=30 if index % 2 else 0,
        )
        reservation_time = reservation_time.replace(day=base_reservation.day)
        reservation_time = reservation_time + __import__("datetime").timedelta(days=day_offset)
        if status in {"Pending", "Confirmed", "Arrived"}:
            while (restaurant_id, int(selected_table["tableid"]), reservation_time) in active_keys:
                reservation_time = reservation_time + __import__("datetime").timedelta(hours=1)
            active_keys.add((restaurant_id, int(selected_table["tableid"]), reservation_time))
            table_id_value = selected_table["tableid"]
            pax = min(int(selected_table["capacity"]), (index % int(selected_table["capacity"])) + 1)
        else:
            table_id_value = selected_table["tableid"] if index % 4 != 0 else None
            pax = min(int(selected_table["capacity"]), (index % 6) + 1)

        customer_id = 201 + (index % 75)
        reservations.append(
            {
                "reservationid": reservation_id,
                "customeraccountid": customer_id,
                "restaurantid": restaurant_id,
                "tableid": table_id_value,
                "reservationdatetime": reservation_time,
                "durationminutes": 120,
                "pax": pax,
                "note": f"Mock reservation {index + 1}",
                "status": status,
                "createdat": base_created,
                "updatedat": base_created,
            }
        )

        restaurant_menu = menu_items_by_restaurant[restaurant_id]
        for item_offset in range(1 + (index % 3)):
            item_id_for_order = restaurant_menu[(index + item_offset) % len(restaurant_menu)]
            reservation_items.append(
                {
                    "reservationitemid": len(reservation_items) + 1,
                    "reservationid": reservation_id,
                    "restaurantid": restaurant_id,
                    "itemid": item_id_for_order,
                    "quantity": 1 + ((index + item_offset) % 3),
                    "unitprice": menu_items[item_id_for_order - 5001]["price"],
                    "note": None if item_offset else "Mock pre-order",
                    "createdat": base_created,
                }
            )

        if index % 2 == 0:
            reservation_special_requests.append(
                {
                    "requestid": len(reservation_special_requests) + 1,
                    "reservationid": reservation_id,
                    "templateid": (index % 4) + 1,
                    "customtext": None,
                }
            )
        elif index % 5 == 0:
            reservation_special_requests.append(
                {
                    "requestid": len(reservation_special_requests) + 1,
                    "reservationid": reservation_id,
                    "templateid": None,
                    "customtext": "Mock custom request",
                }
            )

    reviewable_reservations = [
        row for row in reservations if row["status"] in {"Completed", "Confirmed", "Arrived"}
    ][:400]
    reviews = []
    blog_posts = []
    blog_media = []
    blog_tags = []
    blog_likes = []
    blog_comments = []
    blog_shares = []
    for index, reservation_row in enumerate(reviewable_reservations, start=1):
        review_id = 3000 + index
        rating = 3 + ((index * 7) % 3)
        reviews.append(
            {
                "reviewid": review_id,
                "customeraccountid": reservation_row["customeraccountid"],
                "restaurantid": reservation_row["restaurantid"],
                "reservationid": reservation_row["reservationid"],
                "rating": rating,
                "toiletcleanliness": 3 + (index % 3),
                "dishcleanliness": 3 + ((index + 1) % 3),
                "spacecleanliness": 3 + ((index + 2) % 3),
                "content": f"Mock review {index}: rating {rating} with realistic variation.",
                "isjapanesetag": index % 2 == 0,
                "status": ["Visible", "Visible", "Visible", "Hidden"][index % 4],
                "createdat": base_created,
                "updatedat": base_created,
            }
        )
        if index <= 120:
            blog_id = 4000 + index
            blog_posts.append(
                {
                    "blogid": blog_id,
                    "customeraccountid": reservation_row["customeraccountid"],
                    "restaurantid": reservation_row["restaurantid"],
                    "title": f"Mock restaurant note {index}",
                    "content": f"Mock blog {index}: useful dining note with photos and social interactions.",
                    "status": ["Published", "Published", "Published", "Hidden"][index % 4],
                    "createdat": base_created,
                    "updatedat": base_created,
                }
            )
            if index % 2 == 0:
                blog_media.append(
                    {
                        "mediaid": len(blog_media) + 1,
                        "blogid": blog_id,
                        "mediaurl": f"https://images.example.test/blogs/{blog_id}/photo.jpg",
                        "mediatype": "Photo",
                        "sortorder": 0,
                    }
                )
            for tag_id in [1 + (index % 5), 1 + ((index + 2) % 5)]:
                tag_row = {"blogid": blog_id, "tagid": tag_id}
                if tag_row not in blog_tags:
                    blog_tags.append(tag_row)
            liker_id = customer_profiles[index % len(customer_profiles)]["accountid"]
            if liker_id != reservation_row["customeraccountid"]:
                blog_likes.append(
                    {
                        "blogid": blog_id,
                        "customeraccountid": liker_id,
                        "createdat": base_created,
                    }
                )
            blog_comments.append(
                {
                    "commentid": len(blog_comments) + 1,
                    "blogid": blog_id,
                    "customeraccountid": liker_id,
                    "parentcommentid": None,
                    "content": f"Mock comment for blog {index}.",
                    "status": "Visible",
                    "createdat": base_created,
                    "updatedat": base_created,
                }
            )
            blog_shares.append(
                {
                    "shareid": len(blog_shares) + 1,
                    "blogid": blog_id,
                    "customeraccountid": liker_id,
                    "createdat": base_created,
                }
            )

    promotions = []
    for index, restaurant_row in enumerate(restaurants, start=1):
        is_active = index % 3 != 0
        promotions.append(
            {
                "promotionid": 8000 + index,
                "restaurantid": restaurant_row["restaurantid"],
                "createdbyowneraccountid": restaurant_row["owneraccountid"],
                "approvedbyadminid": 1 if is_active else None,
                "promotiontype": "Campaign" if index % 2 else "Advertisement",
                "targetaudience": "Japanese visitors and local food lovers",
                "titlevn": f"Ưu đãi mock {index:02d}",
                "titlejp": f"モックキャンペーン {index:02d}",
                "contentvn": "Nội dung khuyến mãi mock.",
                "contentjp": "モックキャンペーン内容。",
                "mediaurl": f"https://images.example.test/promotions/{8000 + index}.jpg",
                "termsvn": "Áp dụng trong thời gian mock.",
                "termsjp": "モック期間中に適用。",
                "startdate": datetime(2026, 5, 1, 0, 0, tzinfo=utc),
                "enddate": datetime(2026, 8, 1, 0, 0, tzinfo=utc),
                "status": "Active" if is_active else "Pending",
                "impressions": 500 + index * 123,
                "clicks": 50 + index * 9,
                "totalcost": Decimal(500000 + index * 100000),
            }
        )

    badge_applications = []
    restaurant_badges = []
    for index, restaurant_row in enumerate(restaurants, start=1):
        approved = index <= 10
        badge_applications.append(
            {
                "appid": 6000 + index,
                "restaurantid": restaurant_row["restaurantid"],
                "badgeid": 1,
                "submittedbyowneraccountid": restaurant_row["owneraccountid"],
                "reviewedbyadminid": 1 if approved else None,
                "businesslicenseurl": f"https://files.example.test/verification/{restaurant_row['restaurantid']}/license.pdf",
                "businesslicensepublicid": f"tabelink/restaurants/{restaurant_row['restaurantid']}/verification/business-license/license",
                "foodsafetycerturl": f"https://files.example.test/verification/{restaurant_row['restaurantid']}/food-safety.pdf",
                "foodsafetycertpublicid": f"tabelink/restaurants/{restaurant_row['restaurantid']}/verification/food-safety/cert",
                "status": "Approved" if approved else "Pending",
                "submittedat": base_created,
                "reviewedat": base_created if approved else None,
                "reviewnote": "Mock verified." if approved else None,
            }
        )
        if approved:
            restaurant_badges.append(
                {
                    "restaurantid": restaurant_row["restaurantid"],
                    "badgeid": 1,
                    "grantedbyadminid": 1,
                    "grantedat": base_created,
                    "expiresat": datetime(2027, 5, 1, 1, 0, tzinfo=utc),
                }
            )
            if index % 2 == 0:
                restaurant_badges.append(
                    {
                        "restaurantid": restaurant_row["restaurantid"],
                        "badgeid": 2,
                        "grantedbyadminid": 1,
                        "grantedat": base_created,
                        "expiresat": None,
                    }
                )

    moderation_target_types = ["Review", "Promotion", "BadgeApplication", "Account", "RestaurantMedia"]
    moderation_actions = ["Approve", "Reject", "Hide", "Delete", "Ban", "Unban"]
    moderation_logs = [
        {
            "logid": index,
            "adminaccountid": 1 + (index % 5),
            "targettype": moderation_target_types[index % len(moderation_target_types)],
            "targetid": 1000 + index,
            "actiontype": moderation_actions[index % len(moderation_actions)],
            "reason": f"Mock audit log {index}",
            "createdat": datetime(2026, 5, 1 + (index % 28), index % 24, index % 60, tzinfo=utc),
        }
        for index in range(1, 151)
    ]

    restaurant_analytics = []
    analytics_id = 1
    analytics_start = date(2026, 2, 8)
    for restaurant_row in restaurants:
        for day_index in range(90):
            stat_date = analytics_start + __import__("datetime").timedelta(days=day_index)
            visits = 80 + ((int(restaurant_row["restaurantid"]) + day_index * 13) % 220)
            japanese_visits = visits // (3 + (day_index % 3))
            restaurant_analytics.append(
                {
                    "analyticsid": analytics_id,
                    "restaurantid": restaurant_row["restaurantid"],
                    "statdate": stat_date,
                    "visitcount": visits,
                    "japanesevisitcount": japanese_visits,
                    "reviewcount": (day_index + int(restaurant_row["restaurantid"])) % 7,
                    "reservationcount": 2 + ((day_index + int(restaurant_row["restaurantid"])) % 18),
                    "peakhour": [11, 12, 18, 19, 20][day_index % 5],
                }
            )
            analytics_id += 1

    menu_analytics = []
    analytics_id = 1
    for item_row in menu_items:
        for day_index in range(90):
            stat_date = analytics_start + __import__("datetime").timedelta(days=day_index)
            views = 5 + ((int(item_row["itemid"]) + day_index * 5) % 95)
            menu_analytics.append(
                {
                    "analyticsid": analytics_id,
                    "itemid": item_row["itemid"],
                    "statdate": stat_date,
                    "viewcount": views,
                    "ordercount": views // (4 + day_index % 4),
                }
            )
            analytics_id += 1

    return [
        ("user_account", user_accounts, ["accountid"], None),
        ("feature_master", feature_master, ["featureid"], None),
        ("payment_method", payment_methods, ["paymentmethodid"], None),
        ("hashtag", hashtags, ["tagid"], None),
        ("special_request_template", request_templates, ["templateid"], None),
        ("badge_master", badges, ["badgeid"], None),
        ("customer_profile", customer_profiles, ["accountid"], None),
        ("owner_profile", owner_profiles, ["accountid"], None),
        ("user_follow", follows, ["followeraccountid", "followedaccountid"], None),
        ("restaurant", restaurants, ["restaurantid"], None),
        ("restaurant_media", restaurant_media, ["mediaid"], None),
        ("restaurant_feature", restaurant_features, ["restaurantid", "featureid"], None),
        (
            "restaurant_payment_method",
            restaurant_payment_methods,
            ["restaurantid", "paymentmethodid"],
            None,
        ),
        ("menu_category", menu_categories, ["categoryid"], None),
        ("menu_item", menu_items, ["itemid"], None),
        ("menu_item_criterion", menu_item_criteria, ["criterionid"], None),
        ("restaurant_table", restaurant_tables, ["tableid"], None),
        ("reservation", reservations, ["reservationid"], None),
        ("reservation_item", reservation_items, ["reservationitemid"], None),
        ("reservation_special_request", reservation_special_requests, ["requestid"], None),
        ("review", reviews, ["reviewid"], None),
        ("blog_post", blog_posts, ["blogid"], None),
        ("blog_media", blog_media, ["mediaid"], None),
        ("blog_tag", blog_tags, ["blogid", "tagid"], None),
        ("blog_like", blog_likes, ["blogid", "customeraccountid"], None),
        ("blog_comment", blog_comments, ["commentid"], None),
        ("blog_share", blog_shares, ["shareid"], None),
        ("promotion", promotions, ["promotionid"], None),
        ("badge_application", badge_applications, ["appid"], None),
        ("restaurant_badge", restaurant_badges, ["restaurantid", "badgeid"], None),
        ("moderation_log", moderation_logs, ["logid"], None),
        ("restaurant_analytics_daily", restaurant_analytics, ["analyticsid"], None),
        ("menu_item_analytics_daily", menu_analytics, ["analyticsid"], None),
    ]


def build_sql(include_truncate: bool) -> str:
    sections: list[str] = [
        "-- Generated by database/seeds/generate_mock_sql.py",
        "-- Mock data follows database/inits.sql constraints and FK order.",
        "BEGIN;",
        "SET CONSTRAINTS ALL IMMEDIATE;",
    ]

    if include_truncate:
        sections.extend(
            [
                "-- Optional destructive reset requested by --truncate.",
                "TRUNCATE TABLE "
                "menu_item_analytics_daily, restaurant_analytics_daily, restaurant_badge, "
                "badge_application, promotion, blog_share, blog_comment, blog_like, "
                "blog_tag, blog_media, blog_post, review, "
                "reservation_special_request, reservation_item, reservation, "
                "restaurant_table, menu_item_criterion, menu_item, menu_category, "
                "restaurant_payment_method, restaurant_feature, restaurant_media, "
                "moderation_log, restaurant, user_follow, owner_profile, "
                "customer_profile, badge_master, special_request_template, hashtag, "
                "payment_method, feature_master, user_account "
                "RESTART IDENTITY CASCADE;",
            ]
        )

    for table, rows, conflict_columns, update_columns in build_rows():
        sections.append(f"\n-- {table}")
        sections.append(insert_sql(table, rows, conflict_columns, update_columns))

    identity_columns = [
        ("user_account", "accountid"),
        ("feature_master", "featureid"),
        ("payment_method", "paymentmethodid"),
        ("hashtag", "tagid"),
        ("special_request_template", "templateid"),
        ("badge_master", "badgeid"),
        ("moderation_log", "logid"),
        ("restaurant", "restaurantid"),
        ("restaurant_media", "mediaid"),
        ("menu_category", "categoryid"),
        ("menu_item", "itemid"),
        ("menu_item_criterion", "criterionid"),
        ("restaurant_table", "tableid"),
        ("reservation", "reservationid"),
        ("reservation_item", "reservationitemid"),
        ("reservation_special_request", "requestid"),
        ("review", "reviewid"),
        ("blog_post", "blogid"),
        ("blog_media", "mediaid"),
        ("blog_comment", "commentid"),
        ("blog_share", "shareid"),
        ("promotion", "promotionid"),
        ("badge_application", "appid"),
        ("restaurant_analytics_daily", "analyticsid"),
        ("menu_item_analytics_daily", "analyticsid"),
    ]
    sections.append("\n-- Advance identity sequences after explicit IDs.")
    sections.extend(sequence_sql(table, column) for table, column in identity_columns)
    sections.append("COMMIT;")
    sections.append("")

    return "\n\n".join(sections)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Neon-ready mock SQL for Tabelink.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output SQL path. Default: {DEFAULT_OUTPUT}",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Include a destructive TRUNCATE reset before inserting mock data.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_path = args.output.resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    sql = build_sql(include_truncate=args.truncate)
    output_path.write_text(sql, encoding="utf-8")
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
