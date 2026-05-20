#!/usr/bin/env python3
"""
Generate deterministic Japanese mock SQL for the Tabelink PostgreSQL schema.

The generated rows follow database/inits.sql, insert in foreign-key order, and
use real web image URLs for restaurant, menu, blog, and promotion imagery.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "database" / "seeds" / "mock_data.sql"
PASSWORD_HASH = "$2b$10$biBhTZSASkD/E1oU.rfEKO85yaquAEgomgRBqWyxk33tLrbkzXwSS"


@dataclass(frozen=True)
class RawSql:
    value: str


Row = dict[str, object]


def unsplash(photo_id: str, width: int = 1200, height: int = 800) -> str:
    return f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w={width}&h={height}&q=80"


RESTAURANT_IMAGES = [
    "photo-1517248135467-4c7edcad34c4",
    "photo-1552566626-52f8b828add9",
    "photo-1555396273-367ea4eb4db5",
    "photo-1550966871-3ed3cdb5ed0c",
    "photo-1544148103-0773bf10d330",
    "photo-1590846406792-0adc7f938f1d",
    "photo-1578474846511-04ba529f0b88",
    "photo-1514933651103-005eec06c04b",
]

FOOD_IMAGES = [
    "photo-1569718212165-3a8278d5f624",
    "photo-1544025162-d76694265947",
    "photo-1559847844-5315695dadae",
    "photo-1604908176997-125f25cc6f3d",
    "photo-1504674900247-0877df9cc836",
    "photo-1565958011703-44f9829ba187",
    "photo-1546069901-ba9599a7e63c",
    "photo-1625938144755-652e08e359b7",
    "photo-1547592180-85f173990554",
    "photo-1540189549336-e6e99c3679fe",
    "photo-1600628422019-6348b5665c7c",
    "photo-1612927601601-6638404737ce",
    "photo-1555939594-58d7cb561ad1",
    "photo-1562967914-608f82629710",
    "photo-1745210358756-e7f7ff40e506",
]


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
    if isinstance(value, datetime):
        return "'" + value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z") + "'"
    if isinstance(value, date):
        return "'" + value.isoformat() + "'"
    return "'" + str(value).replace("'", "''") + "'"


def insert_sql(table: str, rows: Iterable[Row], conflict_columns: list[str], update_columns: list[str] | None = None) -> str:
    rows = list(rows)
    if not rows:
        return ""
    columns = list(rows[0].keys())
    for row in rows:
        if list(row.keys()) != columns:
            raise ValueError(f"Inconsistent columns for {table}")

    values = ",\n  ".join("(" + ", ".join(q(row[column]) for column in columns) + ")" for row in rows)
    conflict = ", ".join(conflict_columns)
    if update_columns is None:
        update_columns = [column for column in columns if column not in set(conflict_columns)]
    action = (
        "DO UPDATE SET " + ", ".join(f"{column} = EXCLUDED.{column}" for column in update_columns)
        if update_columns
        else "DO NOTHING"
    )
    return f"INSERT INTO {table} ({', '.join(columns)}) VALUES\n  {values}\nON CONFLICT ({conflict}) {action};"


def sequence_sql(table: str, column: str) -> str:
    return (
        "SELECT setval(\n"
        f"  pg_get_serial_sequence('{table}', '{column}'),\n"
        f"  GREATEST((SELECT COALESCE(MAX({column}), 1) FROM {table}), 1),\n"
        "  TRUE\n"
        ");"
    )


def build_rows() -> list[tuple[str, list[Row], list[str], list[str] | None]]:
    utc = timezone.utc
    base = datetime(2026, 5, 1, 1, 0, tzinfo=utc)
    restaurant_specs = [
        ("バッハコア・フォー食堂", "ハノイ市ハイバーチュン区ダイコーヴィエット通り1番、ハノイ工科大学正門近く", Decimal("21.005930"), Decimal("105.843720"), "ハノイ工科大学周辺で学生と会社員が使いやすいフォー食堂です。"),
        ("タクアンブー・ブンチャー店", "ハノイ市ハイバーチュン区タクアンブー通り22番", Decimal("21.006820"), Decimal("105.845120"), "炭火焼きのブンチャーと日本語メニューに対応する昼食向け店舗です。"),
        ("レタントン・家庭料理", "ハノイ市ハイバーチュン区レタントン通り88番", Decimal("21.010420"), Decimal("105.849880"), "北部家庭料理を落ち着いた席で提供する予約対応店です。"),
        ("チャンダイギア・コムタム", "ハノイ市ハイバーチュン区チャンダイギア通り45番", Decimal("21.004980"), Decimal("105.846410"), "工科大学エリアのランチ需要に合わせたご飯料理の店です。"),
        ("バックマイ・バインミー", "ハノイ市ハイバーチュン区バックマイ通り117番", Decimal("21.001950"), Decimal("105.846930"), "軽食とコーヒーを早い時間から提供するカジュアル店舗です。"),
        ("ミンカイ・海鮮鍋", "ハノイ市ハイバーチュン区ミンカイ通り36番", Decimal("21.000780"), Decimal("105.852220"), "夜の会食と大人数予約に向いた海鮮鍋レストランです。"),
        ("ヴィンホー・春巻き工房", "ハノイ市ドンダー区ヴィンホー通り12番", Decimal("21.008610"), Decimal("105.832950"), "生春巻きと揚げ春巻きを中心にした清潔な小型店舗です。"),
        ("キムリエン・麺キッチン", "ハノイ市ドンダー区キムリエン通り9番", Decimal("21.009260"), Decimal("105.838540"), "麺料理を中心に短時間の食事にも使いやすい店舗です。"),
        ("ザイフォン・屋台食堂", "ハノイ市ハイバーチュン区ザイフォン通り210番", Decimal("21.002940"), Decimal("105.841620"), "大学病院と工科大学の間で屋台風メニューを提供します。"),
        ("ホーヴィエット・ランチ", "ハノイ市ハイバーチュン区ホーヴィエット通り18番", Decimal("21.013480"), Decimal("105.848650"), "静かな昼食と日本語予約に対応するランチ食堂です。"),
        ("バーチエウ・ベトナム食堂", "ハノイ市ハイバーチュン区バーチエウ通り64番", Decimal("21.012180"), Decimal("105.851090"), "買い物帰りにも使いやすい家庭料理レストランです。"),
        ("ローダック・カフェ食堂", "ハノイ市ハイバーチュン区ローダック通り32番", Decimal("21.016210"), Decimal("105.854160"), "コーヒーと軽食、夕食メニューをまとめて提供する店舗です。"),
    ]
    restaurant_count = len(restaurant_specs)

    user_accounts: list[Row] = [
        {"accountid": 1, "email": "admin1@tabelink.test", "passwordhash": PASSWORD_HASH, "role": "Admin", "status": "Active", "createdat": base, "updatedat": base},
    ]
    user_accounts += [
        {"accountid": 100 + i, "email": f"owner{i:02d}@tabelink.test", "passwordhash": PASSWORD_HASH, "role": "Owner", "status": "Active", "createdat": base, "updatedat": base}
        for i in range(1, restaurant_count + 1)
    ]
    user_accounts += [
        {
            "accountid": 200 + i,
            "email": f"user{i:02d}@tabelink.test",
            "passwordhash": PASSWORD_HASH,
            "role": "User",
            "status": ["Active", "Active", "Active", "Pending", "Banned"][i % 5],
            "createdat": base + timedelta(minutes=i),
            "updatedat": base + timedelta(minutes=i),
        }
        for i in range(1, 31)
    ]

    feature_master = [
        {"featureid": 1, "featurecode": "TABLE_MANAGEMENT", "featurenamevn": "席管理", "featurenamejp": "席管理"},
        {"featureid": 2, "featurecode": "ONLINE_RESERVATION", "featurenamevn": "オンライン予約", "featurenamejp": "オンライン予約"},
        {"featureid": 3, "featurecode": "JAPANESE_MENU", "featurenamevn": "日本語メニュー", "featurenamejp": "日本語メニュー"},
        {"featureid": 4, "featurecode": "VAT_INVOICE", "featurenamevn": "領収書対応", "featurenamejp": "領収書対応"},
    ]
    payment_methods = [
        {"paymentmethodid": 1, "methodcode": "CASH", "methodname": "現金"},
        {"paymentmethodid": 2, "methodcode": "CARD", "methodname": "クレジットカード"},
        {"paymentmethodid": 3, "methodcode": "MOMO", "methodname": "電子ウォレット"},
        {"paymentmethodid": 4, "methodcode": "PAYPAY", "methodname": "PayPay"},
    ]
    hashtags = [
        {"tagid": 1, "name": "ベトナム料理"},
        {"tagid": 2, "name": "日本語対応"},
        {"tagid": 3, "name": "清潔"},
        {"tagid": 4, "name": "家族向け"},
        {"tagid": 5, "name": "ランチ"},
        {"tagid": 6, "name": "接待"},
    ]
    request_templates = [
        {"templateid": 1, "textjp": "パクチーを抜いてください", "descriptionjp": "香草が苦手な方向けの依頼です。", "requesttype": "Coriander"},
        {"templateid": 2, "textjp": "辛さを控えめにしてください", "descriptionjp": "唐辛子を少なめにして提供します。", "requesttype": "LessSpicy"},
        {"templateid": 3, "textjp": "領収書をお願いします", "descriptionjp": "会社名入りの領収書が必要な場合に使います。", "requesttype": "VATInvoice"},
        {"templateid": 4, "textjp": "子ども用の椅子をお願いします", "descriptionjp": "小さなお子さま連れの予約向けです。", "requesttype": "Other"},
    ]
    badges = [
        {"badgeid": 1, "badgecode": "VERIFIED", "badgenamevn": "認証済み", "badgenamejp": "認証済み", "descriptionvn": "提出書類を確認済みの店舗です。", "descriptionjp": "提出書類を確認済みの店舗です。", "criteria": "営業許可証、衛生関連書類"},
        {"badgeid": 2, "badgecode": "JP_FRIENDLY", "badgenamevn": "日本人向け", "badgenamejp": "日本人向け", "descriptionvn": "日本語メニューや日本人向け案内があります。", "descriptionjp": "日本語メニューや日本人向け案内があります。", "criteria": "日本語メニュー、予約対応、清潔評価"},
    ]

    customer_profiles = [
        {
            "accountid": 200 + i,
            "fullname": f"利用者{i:02d}",
            "displayname": f"ゲスト{i:02d}",
            "gender": ["Female", "Male", "Other"][i % 3],
            "dob": date(1988 + (i % 18), (i % 12) + 1, (i % 27) + 1),
            "nationality": "日本",
            "purpose": ["出張中の食事", "家族での外食", "現地料理の記録", "友人との会食"][i % 4],
            "avatarurl": f"https://randomuser.me/api/portraits/{'women' if i % 2 else 'men'}/{i + 10}.jpg",
        }
        for i in range(1, 31)
    ]
    owner_profiles = [
        {"accountid": 100 + i, "fullname": f"店舗オーナー{i:02d}", "phone": f"+84280000{i:04d}", "businessname": f"タベリンク運営会社{i:02d}", "avatarurl": f"https://randomuser.me/api/portraits/men/{20 + i}.jpg"}
        for i in range(1, restaurant_count + 1)
    ]
    follows = [
        {"followeraccountid": 200 + i, "followedaccountid": 200 + ((i + 6) % 30) + 1, "createdat": base + timedelta(hours=i)}
        for i in range(1, 25)
        if 200 + i != 200 + ((i + 6) % 30) + 1
    ]

    restaurants = []
    for i, (name, address, lat, lng, desc) in enumerate(restaurant_specs, start=1):
        restaurants.append(
            {
                "restaurantid": 1000 + i,
                "owneraccountid": 100 + i,
                "namevn": name,
                "namejp": name,
                "address": address,
                "latitude": lat,
                "longitude": lng,
                "descriptionvn": desc,
                "descriptionjp": desc,
                "issuesvat": i != 4,
                "phone": f"+84281234{i:04d}",
                "openinghours": ["09:00-21:00", "10:00-22:00", "11:00-23:00", "08:30-21:30", "16:00-23:30"][(i - 1) % 5],
                "status": "Active",
                "createdat": base,
                "updatedat": base,
            }
        )

    restaurant_media = []
    media_id = 1
    for r_index, restaurant in enumerate(restaurants):
        for sort_order, media_type in enumerate(["Cover", "Photo", "Photo", "Photo"]):
            restaurant_media.append(
                {"mediaid": media_id, "restaurantid": restaurant["restaurantid"], "mediaurl": unsplash(RESTAURANT_IMAGES[(r_index * 4 + sort_order) % len(RESTAURANT_IMAGES)], 1400, 900), "mediatype": media_type, "sortorder": sort_order, "status": "Approved"}
            )
            media_id += 1

    restaurant_social_links = [
        {"sociallinkid": i, "restaurantid": 1000 + i, "provider": "Website", "url": f"https://example.com/tabelink/jp/restaurant-{i}", "displaylabel": "公式サイト", "sortorder": 0, "isactive": True}
        for i in range(1, restaurant_count + 1)
    ]
    restaurant_features = [{"restaurantid": 1000 + i, "featureid": feature_id} for i in range(1, restaurant_count + 1) for feature_id in ([1, 2, 3, 4] if i != 4 else [1, 2, 3])]
    restaurant_payment_methods = [{"restaurantid": 1000 + i, "paymentmethodid": method_id} for i in range(1, restaurant_count + 1) for method_id in ([1, 2, 3] if i % 2 else [1, 2, 4])]

    category_defs = [
        ("starter", "前菜", "前菜"),
        ("main", "主菜", "主菜"),
        ("noodle", "麺料理", "麺料理"),
        ("rice", "ご飯料理", "ご飯料理"),
        ("drink", "飲み物", "飲み物"),
    ]
    menu_categories = []
    categories_by_restaurant: dict[int, list[int]] = {}
    category_id = 1
    for restaurant in restaurants:
        restaurant_id = int(restaurant["restaurantid"])
        categories_by_restaurant[restaurant_id] = []
        for sort_order, (code, name_vn, name_jp) in enumerate(category_defs):
            menu_categories.append({"categoryid": category_id, "restaurantid": restaurant_id, "categorycode": code, "categorynamevn": name_vn, "categorynamejp": name_jp, "sortorder": sort_order, "isactive": True})
            categories_by_restaurant[restaurant_id].append(category_id)
            category_id += 1

    dishes = [
        ("牛肉フォー", "澄んだ牛骨スープと米麺の定番料理です。", "米麺、牛肉、ねぎ、香草"),
        ("鶏肉フォー", "やさしい鶏スープで朝食にも合う一品です。", "米麺、鶏肉、玉ねぎ、香草"),
        ("生春巻き", "海老と野菜を包んだ軽い前菜です。", "ライスペーパー、海老、豚肉、野菜"),
        ("揚げ春巻き", "香ばしく揚げた北部風の春巻きです。", "豚肉、きくらげ、春雨、ライスペーパー"),
        ("ブンチャー", "焼き豚と米麺を甘酸っぱいタレで味わいます。", "米麺、豚肉、野菜、魚醤"),
        ("コムタム", "炭火焼き豚と砕き米の満足感ある皿です。", "砕き米、豚肉、卵、漬物"),
        ("バインミー", "軽いパンに具材を重ねたベトナムサンドです。", "バゲット、豚肉、なます、香草"),
        ("ミークアン", "ターメリック麺と濃いめのスープが特徴です。", "米麺、鶏肉、海老、ピーナッツ"),
        ("バインセオ", "米粉の薄焼きに具材を包んで食べます。", "米粉、海老、豚肉、もやし"),
        ("海鮮鍋", "魚介の旨みを楽しむ大人数向けの鍋です。", "海老、魚、貝、野菜"),
        ("空芯菜炒め", "にんにくの香りを効かせた野菜料理です。", "空芯菜、にんにく、魚醤"),
        ("ベトナムコーヒー", "練乳入りの濃厚なアイスコーヒーです。", "コーヒー、練乳、氷"),
        ("緑豆チェー", "食後に合うやさしい甘さのデザートです。", "緑豆、ココナッツミルク、氷"),
        ("魚の土鍋煮", "甘辛いタレで煮込んだ家庭料理です。", "魚、魚醤、砂糖、胡椒"),
        ("焼き鶏レモングラス", "香草の香りが立つ炭火焼き料理です。", "鶏肉、レモングラス、にんにく"),
    ]
    menu_items = []
    menu_item_criteria = []
    items_by_restaurant: dict[int, list[int]] = {}
    item_id = 5001
    criterion_id = 1
    for r_index, restaurant in enumerate(restaurants, start=1):
        restaurant_id = int(restaurant["restaurantid"])
        items_by_restaurant[restaurant_id] = []
        for d_index, (name, description, ingredients) in enumerate(dishes, start=1):
            current_item_id = item_id
            items_by_restaurant[restaurant_id].append(current_item_id)
            menu_items.append(
                {
                    "itemid": current_item_id,
                    "restaurantid": restaurant_id,
                    "categoryid": categories_by_restaurant[restaurant_id][d_index % len(category_defs)],
                    "namevn": name,
                    "namejp": name,
                    "price": Decimal(55000 + ((r_index + d_index) % 12) * 10000),
                    "descriptionvn": description,
                    "descriptionjp": description,
                    "ingredients": ingredients,
                    "isrecommendedforjp": d_index % 4 != 0,
                    "imageurl": unsplash(FOOD_IMAGES[(d_index - 1) % len(FOOD_IMAGES)], 900, 700),
                    "imagepublicid": f"tabelink/restaurants/{restaurant_id}/menus/{current_item_id}",
                    "isactive": True,
                    "deletedat": None,
                    "createdat": base,
                    "updatedat": base,
                }
            )
            for sort_order, criterion_name in enumerate(["味", "清潔感", "日本人向け"]):
                menu_item_criteria.append({"criterionid": criterion_id, "itemid": current_item_id, "criterionname": criterion_name, "ratinglevel": 3 + ((d_index + sort_order + r_index) % 3), "sortorder": sort_order, "createdat": base})
                criterion_id += 1
            item_id += 1

    restaurant_tables = []
    tables_by_restaurant: dict[int, list[Row]] = {}
    table_id = 7001
    for restaurant in restaurants:
        restaurant_id = int(restaurant["restaurantid"])
        tables_by_restaurant[restaurant_id] = []
        for t_index, capacity in enumerate([2, 2, 4, 4, 6, 8], start=1):
            row = {"tableid": table_id, "restaurantid": restaurant_id, "tablename": f"{restaurant_id - 1000}番席-{t_index}", "capacity": capacity, "status": ["Empty", "Reserved", "Empty", "Using", "Empty", "Reserved"][t_index - 1], "positionx": Decimal(40 + ((t_index - 1) % 3) * 120), "positiony": Decimal(50 + ((t_index - 1) // 3) * 120), "width": Decimal(80 + capacity * 10), "height": Decimal("80.00"), "zone": "1階" if t_index <= 3 else "2階"}
            restaurant_tables.append(row)
            tables_by_restaurant[restaurant_id].append(row)
            table_id += 1

    reservations = []
    reservation_items = []
    reservation_special_requests = []
    active_slots: set[tuple[int, int, datetime]] = set()
    statuses = ["Pending", "Confirmed", "Arrived", "Completed", "Completed", "Cancelled"]
    for index in range(250):
        restaurant = restaurants[index % len(restaurants)]
        restaurant_id = int(restaurant["restaurantid"])
        status = statuses[index % len(statuses)]
        table = tables_by_restaurant[restaurant_id][index % len(tables_by_restaurant[restaurant_id])]
        reservation_time = datetime(2026, 5, 2 + (index % 20), [11, 12, 18, 19, 20][index % 5], 0, tzinfo=utc)
        while status in {"Pending", "Confirmed", "Arrived"} and (restaurant_id, int(table["tableid"]), reservation_time) in active_slots:
            reservation_time += timedelta(days=1)
        if status in {"Pending", "Confirmed", "Arrived"}:
            active_slots.add((restaurant_id, int(table["tableid"]), reservation_time))
        reservation_id = 9001 + index
        customer_id = 201 + (index % 30)
        reservations.append({"reservationid": reservation_id, "customeraccountid": customer_id, "restaurantid": restaurant_id, "tableid": table["tableid"], "reservationdatetime": reservation_time, "durationminutes": 120, "pax": 1 + (index % 6), "customername": f"予約者{index + 1:03d}", "phonenumber": f"+81901234{index:04d}", "note": "窓側の席を希望します。" if index % 4 == 0 else None, "status": status, "createdat": base, "updatedat": base})
        for order_offset in range(1 + (index % 3)):
            menu_item_id = items_by_restaurant[restaurant_id][(index + order_offset) % len(items_by_restaurant[restaurant_id])]
            menu_item = menu_items[menu_item_id - 5001]
            reservation_items.append({"reservationitemid": len(reservation_items) + 1, "reservationid": reservation_id, "restaurantid": restaurant_id, "itemid": menu_item_id, "quantity": 1 + ((index + order_offset) % 3), "unitprice": menu_item["price"], "note": "辛さ控えめ" if order_offset == 0 and index % 5 == 0 else None, "createdat": base})
        if index % 3 == 0:
            reservation_special_requests.append({"requestid": len(reservation_special_requests) + 1, "reservationid": reservation_id, "templateid": 1 + (index % 4), "customtext": None})
        if index % 10 == 0:
            reservation_special_requests.append({"requestid": len(reservation_special_requests) + 1, "reservationid": reservation_id, "templateid": None, "customtext": "できれば静かな席をお願いします。"})

    reviewable = [row for row in reservations if row["status"] in {"Completed", "Confirmed", "Arrived"}]
    reviews = []
    blog_posts = []
    blog_media = []
    blog_tags = []
    blog_likes = []
    blog_comments = []
    blog_shares = []
    for index, reservation in enumerate(reviewable[:120], start=1):
        rating = [5, 5, 4, 4, 3, 5, 4, 2][index % 8]
        reviews.append({"reviewid": 3000 + index, "customeraccountid": reservation["customeraccountid"], "restaurantid": reservation["restaurantid"], "reservationid": reservation["reservationid"], "rating": rating, "toiletcleanliness": max(1, min(5, rating)), "dishcleanliness": max(1, min(5, rating + (1 if index % 3 == 0 else 0))), "spacecleanliness": max(1, min(5, rating - (1 if index % 7 == 0 else 0))), "content": f"料理が出るまでの案内が丁寧で、味も日本人に分かりやすい説明でした。訪問記録{index:03d}。", "isjapanesetag": True, "status": ["Visible", "Visible", "Visible", "Hidden"][index % 4], "createdat": base + timedelta(days=index % 30), "updatedat": base + timedelta(days=index % 30)})
        if index <= 60:
            blog_id = 4000 + index
            blog_posts.append({"blogid": blog_id, "customeraccountid": reservation["customeraccountid"], "restaurantid": reservation["restaurantid"], "title": f"ベトナム料理メモ{index:02d}", "content": "予約から会計まで分かりやすく、初めての人にも紹介しやすいお店でした。", "tasterating": rating, "hygienerating": max(1, min(5, rating)), "servicerating": max(1, min(5, rating + (1 if index % 5 == 0 else 0))), "status": ["Published", "Published", "Published", "Hidden"][index % 4], "createdat": base + timedelta(days=index % 20), "updatedat": base + timedelta(days=index % 20)})
            blog_media.append({"mediaid": len(blog_media) + 1, "blogid": blog_id, "mediaurl": unsplash(FOOD_IMAGES[index % len(FOOD_IMAGES)], 1000, 750), "mediatype": "Photo", "sortorder": 0})
            for tag_id in [1 + (index % 6), 1 + ((index + 2) % 6)]:
                row = {"blogid": blog_id, "tagid": tag_id}
                if row not in blog_tags:
                    blog_tags.append(row)
            liker = 201 + ((index + 3) % 30)
            if liker != reservation["customeraccountid"]:
                blog_likes.append({"blogid": blog_id, "customeraccountid": liker, "createdat": base})
            blog_comments.append({"commentid": len(blog_comments) + 1, "blogid": blog_id, "customeraccountid": liker, "parentcommentid": None, "content": "詳しい記録で参考になりました。", "status": "Visible", "createdat": base, "updatedat": base})
            blog_shares.append({"shareid": len(blog_shares) + 1, "blogid": blog_id, "customeraccountid": liker, "createdat": base})

    detail_review_texts = [
        "店内が明るく、料理の説明も日本語で分かりやすかったです。",
        "予約時間どおりに案内され、初めてでも安心して利用できました。",
        "大学周辺で短い昼休みにも使いやすい提供スピードでした。",
        "香草の量を調整してくれて、日本人の友人にも紹介しやすいです。",
        "テーブルと食器が清潔で、家族連れでも入りやすい雰囲気でした。",
        "スタッフの対応が丁寧で、会計までスムーズでした。",
        "メニュー写真と実際の料理が近く、注文しやすかったです。",
        "辛さ控えめの相談ができて、最後までおいしく食べられました。",
        "工科大学から歩きやすい場所で、待ち合わせにも便利でした。",
        "量と価格のバランスが良く、普段使いしたいお店です。",
        "混雑していても席の案内が落ち着いていて好印象でした。",
        "料理の温度がちょうど良く、香りも豊かでした。",
    ]
    review_id = 5000
    for restaurant_index, restaurant in enumerate(restaurants, start=1):
        for offset, text in enumerate(detail_review_texts, start=1):
            rating = [5, 5, 4, 4, 5, 3, 4, 5, 4, 5, 3, 4][offset - 1]
            reviews.append(
                {
                    "reviewid": review_id,
                    "customeraccountid": 201 + ((restaurant_index * 3 + offset) % 30),
                    "restaurantid": restaurant["restaurantid"],
                    "reservationid": None,
                    "rating": rating,
                    "toiletcleanliness": max(1, min(5, rating)),
                    "dishcleanliness": max(1, min(5, rating + (1 if offset % 4 == 0 else 0))),
                    "spacecleanliness": max(1, min(5, rating - (1 if offset % 6 == 0 else 0))),
                    "content": f"{text} 詳細レビュー{restaurant_index:02d}-{offset:02d}。",
                    "isjapanesetag": True,
                    "status": "Visible",
                    "createdat": base + timedelta(days=35 + offset, minutes=restaurant_index),
                    "updatedat": base + timedelta(days=35 + offset, minutes=restaurant_index),
                }
            )
            review_id += 1

    discount_cases = [
        ("Percentage", "10%", "10パーセント割引"),
        ("Percentage", "20%", "20パーセント割引"),
        ("Percentage", "50%", "50パーセント割引"),
        ("Percentage", "100%", "無料キャンペーン"),
        ("FixedAmount", "50000VND", "5万VND割引"),
        ("FixedAmount", "100000VND", "10万VND割引"),
        ("FixedAmount", "200000VND", "20万VND割引"),
    ]
    promotions = []
    promotion_id = 8001
    for restaurant_index, restaurant in enumerate(restaurants, start=1):
        for discount_index, (discount_type, discount_value, label) in enumerate(discount_cases, start=1):
            promotions.append(
                {
                    "promotionid": promotion_id,
                    "restaurantid": restaurant["restaurantid"],
                    "createdbyowneraccountid": restaurant["owneraccountid"],
                    "approvedbyadminid": 1,
                    "promotiontype": "Campaign",
                    "targetaudience": "日本人利用者",
                    "titlevn": f"{label}・工科大学エリア{restaurant_index:02d}-{discount_index:02d}",
                    "titlejp": f"{label}・工科大学エリア{restaurant_index:02d}-{discount_index:02d}",
                    "contentvn": "ハノイ工科大学周辺の店舗で使える予約限定キャンペーンです。",
                    "contentjp": "ハノイ工科大学周辺の店舗で使える予約限定キャンペーンです。",
                    "mediaurl": unsplash(RESTAURANT_IMAGES[(restaurant_index + discount_index) % len(RESTAURANT_IMAGES)], 1200, 700),
                    "termsvn": "予約限定です。",
                    "termsjp": "予約限定です。",
                    "discounttype": discount_type,
                    "discountvalue": discount_value,
                    "advertisementtype": None,
                    "targetradiuskm": None,
                    "startdate": datetime(2026, 5, 1, 0, 0, tzinfo=utc),
                    "enddate": datetime(2026, 8, 1, 0, 0, tzinfo=utc),
                    "status": "Active",
                    "impressions": 1500 + restaurant_index * 200 + discount_index * 50,
                    "clicks": 120 + restaurant_index * 12 + discount_index * 6,
                    "totalcost": Decimal(250000 + restaurant_index * 50000 + discount_index * 25000),
                }
            )
            promotion_id += 1

    for restaurant_index, restaurant in enumerate(restaurants, start=1):
        for ad_type in ["SNS", "Notification"]:
            promotions.append(
                {
                    "promotionid": promotion_id,
                    "restaurantid": restaurant["restaurantid"],
                    "createdbyowneraccountid": restaurant["owneraccountid"],
                    "approvedbyadminid": 1,
                    "promotiontype": "Advertisement",
                    "targetaudience": "all",
                    "titlevn": f"工科大学エリア広告{restaurant_index:02d}-{ad_type}",
                    "titlejp": f"工科大学エリア広告{restaurant_index:02d}-{ad_type}",
                    "contentvn": "ハノイ工科大学周辺の店舗情報を利用者に届ける広告です。",
                    "contentjp": "ハノイ工科大学周辺の店舗情報を利用者に届ける広告です。",
                    "mediaurl": unsplash(RESTAURANT_IMAGES[(restaurant_index + promotion_id) % len(RESTAURANT_IMAGES)], 1200, 700),
                    "termsvn": "広告表示用の掲載です。",
                    "termsjp": "広告表示用の掲載です。",
                    "discounttype": None,
                    "discountvalue": None,
                    "advertisementtype": ad_type,
                    "targetradiuskm": None,
                    "startdate": datetime(2026, 5, 1, 0, 0, tzinfo=utc),
                    "enddate": datetime(2026, 8, 1, 0, 0, tzinfo=utc),
                    "status": "Active",
                    "impressions": 2200 + restaurant_index * 150,
                    "clicks": 180 + restaurant_index * 10,
                    "totalcost": Decimal(350000 + restaurant_index * 40000),
                }
            )
            promotion_id += 1

    redemptions = []
    redemption_id = 1
    for promotion in promotions:
        completed_for_restaurant = [
            row
            for row in reservations
            if row["status"] == "Completed" and row["restaurantid"] == promotion["restaurantid"]
        ][:2]
        for reservation in completed_for_restaurant:
            redemptions.append({"redemptionid": redemption_id, "promotionid": promotion["promotionid"], "restaurantid": promotion["restaurantid"], "reservationid": reservation["reservationid"], "customeraccountid": reservation["customeraccountid"], "redemptionstatus": "Redeemed", "redeemedat": base + timedelta(days=redemption_id), "createdat": base + timedelta(days=redemption_id)})
            redemption_id += 1

    badge_applications = []
    restaurant_badges = []
    for i, restaurant in enumerate(restaurants, start=1):
        badge_applications.append({"appid": 6000 + i, "restaurantid": restaurant["restaurantid"], "badgeid": 1, "submittedbyowneraccountid": restaurant["owneraccountid"], "reviewedbyadminid": 1, "businesslicenseurl": f"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "businesslicensepublicid": f"tabelink/restaurants/{restaurant['restaurantid']}/verification/license", "foodsafetycerturl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "foodsafetycertpublicid": f"tabelink/restaurants/{restaurant['restaurantid']}/verification/food-safety", "status": "Approved", "submittedat": base, "reviewedat": base + timedelta(days=1), "reviewnote": "書類確認済みです。"})
        restaurant_badges.append({"restaurantid": restaurant["restaurantid"], "badgeid": 1, "grantedbyadminid": 1, "grantedat": base + timedelta(days=1), "expiresat": datetime(2027, 5, 1, 0, 0, tzinfo=utc)})
        if i <= 3:
            restaurant_badges.append({"restaurantid": restaurant["restaurantid"], "badgeid": 2, "grantedbyadminid": 1, "grantedat": base + timedelta(days=1), "expiresat": None})

    moderation_logs = [
        {"logid": i, "adminaccountid": 1, "targettype": ["Review", "Promotion", "BadgeApplication", "RestaurantMedia"][i % 4], "targetid": 1000 + i, "actiontype": ["Approve", "Hide", "Reject", "Delete"][i % 4], "reason": "日本語シードデータの確認ログです。", "createdat": base + timedelta(hours=i)}
        for i in range(1, 41)
    ]

    restaurant_analytics = []
    analytics_id = 1
    for restaurant in restaurants:
        for day_index in range(45):
            visits = 90 + ((int(restaurant["restaurantid"]) + day_index * 11) % 160)
            restaurant_analytics.append({"analyticsid": analytics_id, "restaurantid": restaurant["restaurantid"], "statdate": date(2026, 4, 1) + timedelta(days=day_index), "visitcount": visits, "japanesevisitcount": visits // 2, "reviewcount": day_index % 8, "reservationcount": 5 + (day_index % 20), "peakhour": [11, 12, 18, 19, 20][day_index % 5]})
            analytics_id += 1
    menu_analytics = []
    analytics_id = 1
    for item in menu_items:
        for day_index in range(30):
            views = 10 + ((int(item["itemid"]) + day_index * 7) % 90)
            menu_analytics.append({"analyticsid": analytics_id, "itemid": item["itemid"], "statdate": date(2026, 4, 15) + timedelta(days=day_index), "viewcount": views, "ordercount": max(1, views // 6)})
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
        ("restaurant_social_link", restaurant_social_links, ["sociallinkid"], None),
        ("restaurant_feature", restaurant_features, ["restaurantid", "featureid"], None),
        ("restaurant_payment_method", restaurant_payment_methods, ["restaurantid", "paymentmethodid"], None),
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
        ("promotion_redemption", redemptions, ["redemptionid"], None),
        ("badge_application", badge_applications, ["appid"], None),
        ("restaurant_badge", restaurant_badges, ["restaurantid", "badgeid"], None),
        ("moderation_log", moderation_logs, ["logid"], None),
        ("restaurant_analytics_daily", restaurant_analytics, ["restaurantid", "statdate"], ["visitcount", "japanesevisitcount", "reviewcount", "reservationcount", "peakhour"]),
        ("menu_item_analytics_daily", menu_analytics, ["itemid", "statdate"], ["viewcount", "ordercount"]),
    ]


def build_sql(include_truncate: bool) -> str:
    sections = [
        "-- Generated by database/seeds/generate_mock_sql.py",
        "-- Japanese mock data follows database/inits.sql constraints and FK order.",
        "BEGIN;",
        "SET CONSTRAINTS ALL IMMEDIATE;",
    ]
    if include_truncate:
        sections.append(
            "TRUNCATE TABLE "
            "menu_item_analytics_daily, restaurant_analytics_daily, moderation_log, restaurant_badge, "
            "badge_application, promotion_redemption, promotion, blog_share, blog_comment, blog_like, "
            "blog_tag, blog_media, blog_post, review, reservation_special_request, reservation_item, "
            "reservation, restaurant_table, menu_item_criterion, menu_item, menu_category, "
            "restaurant_payment_method, restaurant_feature, restaurant_social_link, restaurant_media, "
            "restaurant, user_follow, owner_profile, customer_profile, badge_master, "
            "special_request_template, hashtag, payment_method, feature_master, user_account "
            "RESTART IDENTITY CASCADE;"
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
        ("restaurant_social_link", "sociallinkid"),
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
        ("promotion_redemption", "redemptionid"),
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
    parser = argparse.ArgumentParser(description="Generate Japanese mock SQL for Tabelink.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help=f"Output SQL path. Default: {DEFAULT_OUTPUT}")
    parser.add_argument("--truncate", action="store_true", help="Include destructive TRUNCATE before inserts.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_path = args.output.resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(build_sql(args.truncate), encoding="utf-8")
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
