"use client";

import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  ExternalLink,
  MapPin,
  PencilLine,
  Phone,
  ReceiptText,
  Share2,
  Star,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

const photos = {
  dish:
    "https://www.figma.com/api/mcp/asset/3d6ca905-7308-4b84-8c12-7d033a31a036",
  staff:
    "https://www.figma.com/api/mcp/asset/2c16c86f-c883-466c-9d16-eb36b61d3241",
  foodDisplay:
    "https://www.figma.com/api/mcp/asset/17838e0d-44fe-43e9-85d7-699649f6cca3",
  interior:
    "https://www.figma.com/api/mcp/asset/d50c2de6-dcb9-4689-83b9-08022b8dc5c3",
  map:
    "https://www.figma.com/api/mcp/asset/29e79a41-9a52-4eb2-88aa-d2adfdea9931",
  editHero:
    "https://www.figma.com/api/mcp/asset/8a5d54ff-7f26-45ea-9725-874ddacaed60",
  editGallery:
    "https://www.figma.com/api/mcp/asset/aaf2da13-3a6c-4366-86ba-e54cfa1c063d",
  springRolls:
    "https://www.figma.com/api/mcp/asset/481b2035-11e0-451d-a901-a83179ecc8a7",
  grilledPork:
    "https://www.figma.com/api/mcp/asset/eaa5e26a-0b5b-49e4-abf7-7f303610592b",
  lotusStemSalad:
    "https://www.figma.com/api/mcp/asset/00d5438d-b901-4775-a3f0-fdbd32971daf",
  steamedFish:
    "https://www.figma.com/api/mcp/asset/ae77030d-184a-4b5a-9e0d-f3d12ca8131c",
};

const infoItems = [
  {
    label: "住所 / Address",
    value: "7-9 Ngô Đức Kế, Bến Nghé, Quận 1, TP. HCM",
    icon: MapPin,
    action: ExternalLink,
  },
  {
    label: "営業時間 / Hours",
    value: "10:00 - 22:00",
    icon: Clock3,
    badge: "Open Now",
  },
  {
    label: "電話番号 / Contact",
    value: "+84 28 3823 1101",
    icon: Phone,
  },
  {
    label: "SNS",
    value: "Facebook    Instagram",
    icon: Share2,
  },
];

const features = [
  {
    eyebrow: "お支払い・領収書",
    title: "VAT対応 / レッドインボイス可",
    icon: ReceiptText,
  },
  {
    eyebrow: "カード利用",
    title: "JCBカード対応",
    icon: CreditCard,
  },
  {
    eyebrow: "サービス",
    title: "日本人スタッフ在籍",
    icon: UsersRound,
  },
];

const formFields = {
  name: "TSUBOMI - 蕾",
  descriptionVn:
    "Đây là một nhà hàng vô cùng nổi tiếng với khách du lịch Nhật Bản tại Hà Nội...",
  descriptionJp:
    "ハノイの中心で四季折々の本格的な日本料理を楽しめる聖域。懐石の技と現地の優雅さを融合させました。",
  address: "15 Hoàn Kiếm District, Hanoi, Vietnam",
  phone: "+84 24 1234 5678",
  hours: "11:30 - 22:30",
  instagram: "instagram.com/tsubomi_hanoi",
  facebook: "fb.com/tsubomijapanese",
};

const menuItems = [
  {
    nameJp: "伝統的な揚げ春巻き",
    nameVn: "Nem Rán Truyền Thống",
    price: "120,000 VND",
    description:
      "マイルドな味わいで、日本の方にも大変人気があります。外はカリッと、中はジューシーな豚肉と野菜の旨味が広がります。",
    image: photos.springRolls,
    spice: 0,
    coriander: 1,
    recommended: true,
  },
  {
    nameJp: "竹筒入りの豚肉焼き",
    nameVn: "Thịt Heo Nướng Ống Tre",
    price: "245,000 VND",
    description:
      "竹の香りがほのかに移った香ばしい豚肉です。スパイスは控えめで、肉本来の甘みを楽しめる逸品です。",
    image: photos.grilledPork,
    spice: 1,
    coriander: 0,
    soldOut: true,
  },
  {
    nameJp: "蓮の茎と海老のサラダ",
    nameVn: "Gỏi Ngó Sen Tôm Thịt",
    price: "185,000 VND",
    description:
      "シャキシャキとした蓮の茎の食感が特徴的。甘酸っぱいタレでさっぱりと頂けます。パクチー抜きも可能です。",
    image: photos.lotusStemSalad,
    spice: 1,
    coriander: 2,
  },
  {
    nameJp: "シーバスの香港蒸し",
    nameVn: "Cá Chẽm Hấp Hồng Kông",
    price: "580,000 VND",
    description:
      "非常に柔らかく蒸し上げられたシーバス。生姜と醤油の味付けは日本人の口に非常に馴染みやすいです。",
    image: photos.steamedFish,
    spice: 0,
    coriander: 0,
  },
];

const reviews = [
  {
    name: "Kenji Sato",
    initial: "K",
    type: "在住日本人",
    typeClass: "border-[#3d5f4633] bg-[#3d5f461a] text-[#3d5f46]",
    meta: "ハノイ在住 (3年)",
    rating: 5,
    text: "とにかく清潔感が素晴らしい。おしぼりも綺麗で、トイレの清掃も行き届いています。会食で利用しましたが、ベトナム料理が初めての出張者も大満足でした。",
    verified: "衛生・サービス確認済み",
    avatarClass: "bg-[#dfe5d4] text-[#5a6053]",
  },
  {
    name: "Nguyen H.",
    initial: "N",
    type: "ベトナム人",
    typeClass: "border-[#dbeafe] bg-[#eff6ff] text-[#1d4ed8]",
    meta: "Local Foodie",
    rating: 4,
    text: "Gia đình tôi thường xuyên đến đây vào cuối tuần. Không gian ấm cúng, món ăn mang hương vị truyền thống nhưng trình bày rất hiện đại.",
    verified: "認証済みユーザー",
    avatarClass: "bg-[#af111c1a] text-[#af111c]",
  },
  {
    name: "Hiroshi Y.",
    initial: "H",
    type: "在住日本人",
    typeClass: "border-[#3d5f4633] bg-[#3d5f461a] text-[#3d5f46]",
    meta: "法人マネージャー",
    rating: 5,
    text: "日本人スタッフの方がいるので、予約時の細かな要望（個室の指定や、アレルギー対応など）が日本語で伝えられるのが最大の安心材料です。",
    verified: "予約の安心感確認済み",
    avatarClass: "bg-[#dfe5d4] text-[#5a6053]",
  },
];

function PhotoTile({
  src,
  alt,
  className,
  imagePosition = "center",
}: {
  src: string;
  alt: string;
  className: string;
  imagePosition?: string;
}) {
  return (
    <div
      aria-label={alt}
      className={`overflow-hidden rounded bg-cover ${className}`}
      role="img"
      style={{ backgroundImage: `url(${src})`, backgroundPosition: imagePosition }}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase leading-[15px] tracking-[1.5px] text-[#5a6053] font-jp">
        {label}
      </span>
      {children}
    </label>
  );
}

function DotScale({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-[#5a6053] font-jp">
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className="size-2 rounded-full"
            style={{
              backgroundColor:
                level <= value ? color : color === "#af111c" ? "#f0d8da" : "#d8e1d7",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MenuCard({ item }: { item: (typeof menuItems)[number] }) {
  return (
    <article className="relative isolate flex min-h-[216px] overflow-hidden rounded-lg border border-[#e4beba1a] bg-white shadow-sm max-md:flex-col">
      {item.soldOut ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/5">
          <span className="rounded-xl border border-[#8f6f6c] bg-white/90 px-6 py-2 text-base font-bold tracking-[1.6px] text-[#5b403d] shadow-sm font-jp">
            売り切れ / Out of Stock
          </span>
        </div>
      ) : null}
      <div className={`w-[34%] min-w-40 bg-cover bg-center max-md:h-52 max-md:w-full ${item.soldOut ? "opacity-75 grayscale" : ""}`} style={{ backgroundImage: `url(${item.image})` }} />
      <div className={`flex flex-1 flex-col justify-between p-6 ${item.soldOut ? "opacity-60 grayscale" : ""}`}>
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium leading-7 text-[#1a1c1b] font-jp">
                {item.nameJp}
              </h3>
              <p className="mt-0.5 text-xs font-medium leading-4 text-[#5a6053] font-manrope">
                {item.nameVn}
              </p>
            </div>
            <p className={`shrink-0 text-base font-medium leading-6 font-jp ${item.soldOut ? "text-[#5b403d]/50 line-through" : "text-[#af111c]"}`}>
              {item.price}
            </p>
          </div>
          <p className="mt-4 text-sm font-medium leading-[22.75px] text-[#5b403d] font-jp">
            {item.description}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#e4beba1a] pt-4">
          <DotScale label="辛さ" value={item.spice} color="#af111c" />
          <DotScale label="パクチー" value={item.coriander} color="#3d5f46" />
          {item.recommended ? (
            <span className="rounded-sm bg-[#af111c] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.5px] text-[#fff2f0] font-jp">
              おすすめ
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function StarRating({ rating, size = "size-3.5" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5 text-[#f5a400]" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((score) => (
        <Star key={score} className={`${size} ${score <= rating ? "fill-current" : ""}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <article className="flex min-h-[240px] flex-col rounded-lg border border-[#e4beba1a] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-start">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-medium font-jp ${review.avatarClass}`}>
          {review.initial}
        </div>
        <div className="min-w-0 pl-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium leading-5 text-[#1a1c1b] font-jp">
              {review.name}
            </h3>
            <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-medium leading-[15px] font-jp ${review.typeClass}`}>
              {review.type}
            </span>
          </div>
          <span className="mt-1 inline-flex rounded-full bg-[#5a6053] px-2 py-0.5 text-[10px] leading-[15px] text-[#dfe5d4] font-jp">
            {review.meta}
          </span>
        </div>
      </div>
      <div className="mt-5">
        <StarRating rating={review.rating} />
      </div>
      <p className="mt-2 flex-1 text-sm leading-[22.75px] text-[#5b403d] font-jp">
        &quot;{review.text}&quot;
      </p>
      <div className="mt-6 border-t border-[#e4beba1a] pt-4">
        <div className="flex items-center gap-2 text-xs font-medium leading-4 text-[#3d5f46] font-jp">
          <CheckCircle2 className="size-3.5" />
          {review.verified}
        </div>
      </div>
    </article>
  );
}

function MenuSection() {
  return (
    <section className="mx-auto flex max-w-[1280px] flex-col gap-12 px-8 py-20 max-md:px-4">
      <div className="flex items-center justify-between gap-6 max-lg:flex-col max-lg:items-start">
        <h2 className="text-3xl font-bold leading-9 tracking-[-0.75px] text-[#1a1c1b] font-brand max-md:text-2xl">
          おすすめメニュー / Recommended Menu
        </h2>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl bg-[#1a1c1b] px-4 py-2 text-sm font-medium leading-5 text-[#f9f9f6] font-jp">
            メイン料理
          </button>
          <button className="rounded-xl bg-[#e8e8e5] px-4 py-2 text-sm font-medium leading-5 text-[#5b403d] font-jp">
            スターター
          </button>
          <button className="rounded-xl bg-[#e8e8e5] px-4 py-2 text-sm font-medium leading-5 text-[#5b403d] font-jp">
            デザート
          </button>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {menuItems.map((item) => (
          <MenuCard key={item.nameJp} item={item} />
        ))}
      </div>
    </section>
  );
}

function CommunityReviewsSection() {
  return (
    <section className="bg-[#f4f4f1] py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-8 max-md:px-4">
        <div className="flex items-end justify-between gap-6 pb-4 max-md:flex-col max-md:items-start">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase leading-5 tracking-[1.4px] text-[#af111c] font-jp">
              コミュニティの声
            </p>
            <h2 className="text-3xl font-bold leading-9 tracking-[-0.75px] text-[#1a1c1b] font-brand max-md:text-2xl">
              ユーザーレビュー / Community Reviews
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2 max-md:items-start">
            <StarRating rating={4} size="size-5" />
            <p className="text-sm font-bold leading-5 text-[#5b403d] font-jp">
              4.2 (120件のレビュー)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 rounded-lg border border-[#e4beba1a] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium uppercase tracking-[1.2px] text-[#5a6053] font-jp">
              絞り込み:
            </span>
            <button className="rounded bg-[#af111c] px-3 py-1.5 text-xs font-medium leading-4 text-white font-jp">すべて</button>
            <button className="rounded bg-[#e8e8e5] px-3 py-1.5 text-xs font-medium leading-4 text-[#5b403d] font-jp">在住日本人</button>
            <button className="rounded bg-[#e8e8e5] px-3 py-1.5 text-xs font-medium leading-4 text-[#5b403d] font-jp">ベトナム人</button>
          </div>
          <div className="h-6 w-px bg-[#e4beba33] max-sm:hidden" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[1.2px] text-[#5a6053] font-jp">
              評価:
            </span>
            <button className="inline-flex items-center gap-3 rounded bg-[#e8e8e5] px-3 py-1.5 text-xs font-medium leading-4 text-[#1a1c1b] font-jp">
              すべての評価
              <ChevronDown className="size-4 text-[#5a6053]" />
            </button>
          </div>
        </div>
        <div className="grid gap-6 pb-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded bg-[#f4f4f1] px-4 py-3 text-sm leading-5 text-[#1a1c1b] outline-none transition-shadow focus:ring-1 focus:ring-[#af111c] font-manrope";

function EditRestaurantModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1a1c1b]/40 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-restaurant-title"
    >
      <div className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[896px] flex-col overflow-hidden rounded-lg bg-[#f9f9f6] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="z-10 flex shrink-0 items-center justify-between bg-[#f9f9f6]/90 px-8 py-5 backdrop-blur-md">
          <h2
            id="edit-restaurant-title"
            className="text-2xl font-bold uppercase leading-8 tracking-[-0.6px] text-[#af111c] font-jp"
          >
            レストラン情報の編集
          </h2>
          <button
            type="button"
            aria-label="Close restaurant edit dialog"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-xl bg-[#e8e8e5] text-[#5a6053] transition-colors hover:bg-[#dededb] hover:text-[#1a1c1b]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto px-8 pb-6 pt-5">
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-8 bg-[#af111c]" />
              <h3 className="text-xs font-bold uppercase leading-4 tracking-[2.4px] text-[#af111c] font-jp">
                写真管理
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <div
                aria-label="Current hero photo"
                className="relative col-span-2 h-[309px] overflow-hidden rounded-lg bg-cover bg-center max-md:col-span-1"
                role="img"
                style={{ backgroundImage: `url(${photos.editHero})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1b]/60 to-[#1a1c1b]/0" />
                <button
                  type="button"
                  className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded border border-white/30 bg-[#f9f9f6]/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md font-manrope"
                >
                  <Camera className="size-3.5" />
                  Change Hero Photo
                </button>
              </div>

              <div className="grid gap-4">
                <button
                  type="button"
                  className="flex h-[146px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e4beba4d] bg-[#eeeeeb] text-[#5a6053] transition-colors hover:bg-[#e8e8e5]"
                >
                  <Camera className="size-6" />
                  <span className="text-[10px] font-bold uppercase tracking-[1px] font-manrope">
                    Add Gallery
                  </span>
                </button>
                <div
                  aria-label="Gallery food photo"
                  className="h-[146px] rounded-lg bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${photos.editGallery})` }}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-8">
              <Field label="店名">
                <input
                  className={`${inputClass} text-lg font-bold leading-7 font-brand`}
                  defaultValue={formFields.name}
                />
              </Field>
              <Field label="説明 (ベトナム語)">
                <textarea
                  className={`${inputClass} min-h-[80px] resize-none leading-[22px]`}
                  defaultValue={formFields.descriptionVn}
                />
              </Field>
              <Field label="説明 (日本語)">
                <textarea
                  className={`${inputClass} min-h-[102px] resize-none leading-[22px] font-jp`}
                  defaultValue={formFields.descriptionJp}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-8">
              <Field label="住所">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-[#af111c]" />
                  <input
                    className={`${inputClass} pl-11`}
                    defaultValue={formFields.address}
                  />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="電話番号">
                  <input className={inputClass} defaultValue={formFields.phone} />
                </Field>
                <Field label="Operating Hours / 営業時間">
                  <input className={inputClass} defaultValue={formFields.hours} />
                </Field>
              </div>

              <Field label="SNSリンク">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded bg-[#f4f4f1] p-2">
                    <span className="flex h-8 w-7 items-center justify-center rounded-md bg-white text-[#af111c]">
                      <span className="text-[11px] font-bold leading-none font-brand">
                        IG
                      </span>
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs leading-4 text-[#1a1c1b] outline-none font-manrope"
                      defaultValue={formFields.instagram}
                    />
                  </div>
                  <div className="flex items-center gap-3 rounded bg-[#f4f4f1] p-2">
                    <span className="flex h-8 w-7 items-center justify-center rounded-md bg-white text-[#af111c]">
                      <span className="text-sm font-bold leading-none font-brand">
                        f
                      </span>
                    </span>
                    <input
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs leading-4 text-[#1a1c1b] outline-none font-manrope"
                      defaultValue={formFields.facebook}
                    />
                  </div>
                </div>
              </Field>
            </div>
          </section>

          <div className="sticky bottom-0 -mx-8 flex justify-end gap-3 border-t border-[#e2e3e0] bg-[#f9f9f6]/95 px-8 py-5 backdrop-blur-md max-sm:flex-col">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[120px] rounded border border-[#af111c] px-6 py-2.5 text-sm font-bold leading-5 tracking-[0.4px] text-[#5a6053] transition-colors hover:bg-[#af111c]/5 font-jp"
            >
              キャンセル
            </button>
            <button
              type="button"
              className="min-w-[140px] rounded bg-[linear-gradient(169deg,#af111c_0%,#d32f31_100%)] px-7 py-2.5 text-sm font-bold leading-5 tracking-[0.4px] text-white shadow-[0_10px_15px_-3px_rgba(175,17,28,0.2),0_4px_6px_-4px_rgba(175,17,28,0.2)] transition-opacity hover:opacity-90 font-jp"
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerHomePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f9f9f6] pb-12">
      <section className="bg-[#eeeeeb]">
        <div className="grid h-[614px] grid-cols-4 grid-rows-2 gap-2 p-2 max-lg:h-[520px] max-md:h-auto max-md:grid-cols-1 max-md:grid-rows-none">
          <div
            aria-label="Hoang Yen Cuisine restaurant interior"
            className="relative col-span-2 row-span-2 overflow-hidden rounded bg-cover bg-center max-md:col-span-1 max-md:h-[360px]"
            role="img"
            style={{ backgroundImage: `url(${photos.interior})` }}
          >
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-xl bg-[#3d5f46] px-4 py-2 text-xs font-medium uppercase tracking-[1.2px] text-white shadow-lg font-jp">
              <BadgeCheck className="size-3.5" />
              認証済みレストラン
            </div>
          </div>
          <PhotoTile
            src={photos.dish}
            alt="Vietnamese dish"
            className="max-md:h-56"
          />
          <PhotoTile
            src={photos.staff}
            alt="Restaurant staff"
            className="max-md:h-56"
          />
          <PhotoTile
            src={photos.foodDisplay}
            alt="Food display"
            className="col-span-2 max-md:col-span-1 max-md:h-56"
          />
        </div>
      </section>

      <section className="relative z-10 mx-8 -mt-16 rounded-lg border border-[#e4beba1a] bg-white p-10 shadow-[0_20px_25px_-5px_rgba(26,28,27,0.05),0_8px_10px_-6px_rgba(26,28,27,0.05)] max-md:mx-4 max-md:p-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium uppercase tracking-[1.4px] text-[#3d5f46] font-jp">
                伝統的なベトナム料理
              </p>
              <h1 className="text-5xl font-extrabold leading-none tracking-[-2.4px] text-[#1a1c1b] font-brand max-md:text-4xl">
                Hoang Yen Cuisine
              </h1>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-md border-2 border-[#d32f2f] px-[18px] py-2.5 text-sm font-bold text-[#d32f2f] transition-colors hover:bg-[#d32f2f]/5 font-jp"
              >
                <PencilLine className="size-3.5" />
                店舗情報を編集
              </button>
              <p className="pt-2 text-lg font-medium leading-7 text-[#5a6053] font-jp">
                ホアン・イェン・キュイジーヌ
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              {infoItems.map((item) => {
                const Icon = item.icon;
                const Action = item.action;

                return (
                  <div key={item.label} className="flex items-start">
                    <Icon className="mt-0.5 size-5 shrink-0 text-[#d32f2f]" />
                    <div className="min-w-0 pl-3">
                      <p className="text-sm font-bold leading-5 text-[#1a1c1b] font-jp">
                        {item.label}
                      </p>
                      <div className="mt-1 flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm leading-5 text-[#5a6053] font-manrope">
                          {item.value}
                        </p>
                        {item.badge ? (
                          <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold leading-[15px] text-[#15803d]">
                            {item.badge}
                          </span>
                        ) : null}
                        {Action ? (
                          <button
                            type="button"
                            aria-label="Open address externally"
                            className="rounded-md p-1 text-[#5a6053] hover:bg-[#eeeeeb]"
                          >
                            <Action className="size-3" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-[#e4beba33] bg-[#e8e8e5] shadow-inner max-lg:min-h-[260px]">
            <div
              aria-label="Map near Hoang Yen Cuisine"
              className="absolute inset-0 bg-cover bg-center opacity-90 saturate-50"
              role="img"
              style={{ backgroundImage: `url(${photos.map})` }}
            />
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute left-1/2 top-[62px] flex -translate-x-1/2 flex-col items-center">
              <div className="rounded border-2 border-white bg-[#d32f2f] px-4 py-2 text-[11px] font-bold leading-none text-white shadow-[0_0_0_4px_rgba(211,47,47,0.2),0_20px_25px_-5px_rgba(0,0,0,0.1)]">
                Takumi Japanese Restaurant
              </div>
              <div className="mt-3 flex size-14 items-center justify-center rounded-xl border-4 border-white bg-[#d32f2f] text-white shadow-2xl">
                <Utensils className="size-7" />
              </div>
              <div className="h-4 w-1.5 bg-[#d32f2f] shadow-md" />
            </div>
            <button
              type="button"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-md border border-[#e4beba4d] bg-white px-2.5 py-2 text-xs font-bold text-[#5b403d] shadow-md font-jp"
            >
              <ExternalLink className="size-3" />
              Google Mapで開く
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e4beba1a] pt-10">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="flex items-center">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#dfe5d4] text-[#3d5f46]">
                    <Icon className="size-5" />
                  </div>
                  <div className="pl-4">
                    <p className="text-xs font-medium uppercase leading-4 tracking-[1.2px] text-[#5a6053] font-jp">
                      {feature.eyebrow}
                    </p>
                    <p className="mt-1 text-base font-medium leading-6 text-[#1a1c1b] font-jp">
                      {feature.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <MenuSection />
      <CommunityReviewsSection />
      {isEditModalOpen ? (
        <EditRestaurantModal onClose={() => setIsEditModalOpen(false)} />
      ) : null}
    </main>
  );
}
