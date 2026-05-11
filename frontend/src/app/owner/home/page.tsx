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
  Plus,
  ReceiptText,
  Share2,
  Star,
  Utensils,
  UsersRound,
  X,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getOwnerHome,
  updateOwnerRestaurant,
  uploadOwnerRestaurantImage,
} from "@/lib/api/owner-home/API";
import type {
  OwnerHomeMenuItem,
  OwnerHomeResponse,
  OwnerHomeReviewItem,
} from "@/lib/api/owner-home/type";
import {
  OWNER_TOAST_MESSAGES,
  showErrorToast,
  showSuccessToast,
} from "@/lib/app-toast";

const photos = {
  dish:
    "https://www.figma.com/api/mcp/asset/3d6ca905-7308-4b84-8c12-7d033a31a036",
  staff:
    "https://www.figma.com/api/mcp/asset/2c16c86f-c883-466c-9d16-eb36b61d3241",
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

const maxGalleryImages = 3;
const fallbackGalleryImages = [photos.dish, photos.staff, photos.editGallery];

const infoItems = [
  {
    label: "住所 / Address",
    value: "7-9 Ngô Đức Kế, Bến Nghé, Quận 1, TP. HCM",
    icon: MapPin,
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

type HomeInfoItem = (typeof infoItems)[number];
type HomeFeatureItem = (typeof features)[number];
type MenuCategoryDisplayItem = {
  code: string;
  label: string;
};
type MenuDisplayItem = {
  itemId: number;
  categoryCode?: string | null;
  categoryName?: string | null;
  nameJp: string;
  nameVn: string;
  price: string;
  description: string;
  image: string;
  criteria: Array<{
    criterionName: string;
    ratingLevel: number;
    sortOrder: number;
  }>;
  recommended?: boolean;
  soldOut?: boolean;
};
type ReviewDisplayItem = {
  audience: "all" | "japanese" | "vietnamese";
  name: string;
  initial: string;
  type: string;
  typeClass: string;
  meta: string;
  rating: number;
  text: string;
  verified: string;
  avatarClass: string;
};

function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function buildGoogleMapsUrl(restaurant: OwnerHomeResponse["restaurant"] | undefined) {
  if (!restaurant) {
    return "https://www.google.com/maps";
  }

  if (restaurant.latitude !== null && restaurant.longitude !== null) {
    return `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`;
  }

  const address = restaurant.address.trim();
  return address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "https://www.google.com/maps";
}

function toMenuDisplayItems(items: OwnerHomeMenuItem[]): MenuDisplayItem[] {
  return items.map((item, index) => ({
    itemId: item.itemId,
    categoryCode:
      item.category?.categoryCode ?? item.categoryId?.toString() ?? null,
    categoryName:
      item.category?.categoryNameJp || item.category?.categoryNameVn || null,
    nameJp: item.nameJp || item.nameVn,
    nameVn: item.nameVn,
    price: formatVnd(item.price),
    description: item.descriptionJp || item.descriptionVn || "",
    image: item.imageUrl || menuItems[index % menuItems.length].image,
    criteria: item.criteria
      .map((criterion) => ({
        criterionName: criterion.criterionName,
        ratingLevel: Math.max(0, Math.min(5, Math.round(criterion.ratingLevel))),
        sortOrder: criterion.sortOrder,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    recommended: item.isRecommendedForJp,
    soldOut: !item.isActive,
  }));
}

function toMenuCategories(
  categories: OwnerHomeResponse["menu"]["categories"] | undefined,
  items: MenuDisplayItem[],
): MenuCategoryDisplayItem[] {
  if (categories && categories.length > 0) {
    return categories.slice(0, 3).map((category) => ({
      code: category.categoryCode || category.categoryId.toString(),
      label: category.categoryNameJp || category.categoryNameVn,
    }));
  }

  const categoryMap = new Map<string, string>();

  for (const item of items) {
    const code = item.categoryCode || "uncategorized";
    const label = item.categoryName || "未分類";

    if (!categoryMap.has(code)) {
      categoryMap.set(code, label);
    }
  }

  return Array.from(categoryMap, ([code, label]) => ({ code, label })).slice(
    0,
    3,
  );
}

function toReviewDisplayItems(items: OwnerHomeReviewItem[]): ReviewDisplayItem[] {
  return items.slice(0, 3).map((item) => {
    const name = item.customerName || `User #${item.customerAccountId}`;
    const initial = name.trim().charAt(0).toUpperCase() || "U";

    return {
      audience: item.isJapaneseTag ? "japanese" : "vietnamese",
      name,
      initial,
      type: item.isJapaneseTag ? "在住日本人" : "ベトナム人",
      typeClass: item.isJapaneseTag
        ? "border-[#3d5f4633] bg-[#3d5f461a] text-[#3d5f46]"
        : "border-[#dbeafe] bg-[#eff6ff] text-[#1d4ed8]",
      meta: item.isJapaneseTag ? "Japanese Community" : "Local Foodie",
      rating: Math.max(0, Math.min(5, Math.round(item.rating))),
      text: item.content || "コメントはありません。",
      verified: item.isJapaneseTag ? "衛生・サービス確認済み" : "認証済みユーザー",
      avatarClass: item.isJapaneseTag
        ? "bg-[#dfe5d4] text-[#5a6053]"
        : "bg-[#af111c1a] text-[#af111c]",
    };
  });
}

function buildInfoItems(homeData: OwnerHomeResponse | null): HomeInfoItem[] {
  const restaurant = homeData?.restaurant;

  if (!restaurant) {
    return infoItems;
  }

  const socialLabels = restaurant.socialLinks
    .map((link) => link.displayLabel || link.provider)
    .filter(Boolean)
    .join("    ");

  return [
    {
      label: "住所 / Address",
      value: restaurant.address,
      icon: MapPin,
    },
    {
      label: "営業時間 / Hours",
      value: restaurant.openingHours || "未設定",
      icon: Clock3,
      badge: "Open Now",
    },
    {
      label: "電話番号 / Contact",
      value: restaurant.phone || "未設定",
      icon: Phone,
    },
    {
      label: "SNS",
      value: socialLabels || "未設定",
      icon: Share2,
    },
  ];
}

function buildFeatures(homeData: OwnerHomeResponse | null): HomeFeatureItem[] {
  const restaurant = homeData?.restaurant;

  if (!restaurant) {
    return features;
  }

  const payment = restaurant.paymentMethods
    .map((method) => method.methodName || method.methodCode)
    .filter(Boolean)
    .join(" / ");
  const service = restaurant.features
    .map((feature) => feature.featureNameJp || feature.featureNameVn)
    .filter(Boolean)
    .join(" / ");

  return [
    {
      eyebrow: "お支払い・領収書",
      title: restaurant.issuesVat ? "VAT対応 / レッドインボイス可" : "VAT情報未設定",
      icon: ReceiptText,
    },
    {
      eyebrow: "カード利用",
      title: payment || "支払い方法未設定",
      icon: CreditCard,
    },
    {
      eyebrow: "サービス",
      title: service || "サービス情報未設定",
      icon: UsersRound,
    },
  ];
}

function buildEditFields(homeData: OwnerHomeResponse | null) {
  const restaurant = homeData?.restaurant;

  if (!restaurant) {
    return formFields;
  }

  return {
    name: restaurant.nameJp || restaurant.nameVn,
    descriptionVn: restaurant.descriptionVn || "",
    descriptionJp: restaurant.descriptionJp || "",
    address: restaurant.address,
    phone: restaurant.phone || "",
    hours: restaurant.openingHours || "",
    instagram: restaurant.sns.instagram || "",
    facebook: restaurant.sns.facebook || "",
  };
}

function isDisplayableRestaurantImageUrl(url: string | null | undefined) {
  const normalizedUrl = url?.trim();

  if (!normalizedUrl) {
    return false;
  }

  if (normalizedUrl.startsWith("/") || normalizedUrl.startsWith("blob:")) {
    return true;
  }

  try {
    const hostname = new URL(normalizedUrl).hostname.toLowerCase();
    return !(
      hostname === "images.example.test" ||
      hostname.endsWith(".example.test") ||
      hostname === "example.com"
    );
  } catch {
    return false;
  }
}

function uniqueImageUrls(urls: string[]) {
  return Array.from(new Set(urls.filter(isDisplayableRestaurantImageUrl)));
}

function buildRestaurantImages(
  restaurant: OwnerHomeResponse["restaurant"] | null | undefined,
) {
  const sortedMedia = [...(restaurant?.media ?? [])]
    .filter((item) => isDisplayableRestaurantImageUrl(item.mediaUrl))
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.mediaId - b.mediaId,
    );
  const coverMedia = sortedMedia.find(
    (item) => item.mediaType.toLowerCase() === "cover",
  );
  const explicitCoverImage = isDisplayableRestaurantImageUrl(
    restaurant?.coverImageUrl,
  )
    ? restaurant?.coverImageUrl
    : null;
  const coverImage =
    coverMedia?.mediaUrl ||
    explicitCoverImage ||
    sortedMedia[0]?.mediaUrl ||
    photos.interior;
  const photoImages = sortedMedia
    .filter((item) => item.mediaType.toLowerCase() === "photo")
    .map((item) => item.mediaUrl);
  const remainingImages = sortedMedia
    .filter((item) => item.mediaUrl !== coverImage)
    .map((item) => item.mediaUrl);

  return {
    coverImage,
    galleryImages: uniqueImageUrls([...photoImages, ...remainingImages]).filter(
      (url) => url !== coverImage,
    ),
  };
}

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

function RestaurantPhotoGrid({
  galleryImages,
  heroImage,
  isVerified,
}: {
  galleryImages: string[];
  heroImage: string;
  isVerified: boolean;
}) {
  const visibleGalleryImages = galleryImages.slice(0, 3);
  const displayImages = [
    visibleGalleryImages[0] || fallbackGalleryImages[0],
    visibleGalleryImages[1] || fallbackGalleryImages[1],
    visibleGalleryImages[2] || fallbackGalleryImages[2],
  ];
  return (
    <section className="bg-[#eeeeeb]">
      <div className="grid h-[614px] grid-cols-4 grid-rows-2 gap-2 p-2 max-lg:h-[520px] max-md:h-auto max-md:grid-cols-1 max-md:grid-rows-none">
        <div
          aria-label="Restaurant main photo"
          className="relative col-span-2 row-span-2 overflow-hidden rounded bg-cover bg-center max-md:col-span-1 max-md:h-[360px]"
          role="img"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          {isVerified ? (
            <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-xl bg-[#3d5f46] px-4 py-2 text-xs font-medium uppercase tracking-[1.2px] text-white shadow-lg font-jp">
              <BadgeCheck className="size-3.5" />
              認証済みレストラン
            </div>
          ) : null}
        </div>
        <PhotoTile
          src={displayImages[0]}
          alt="Restaurant gallery photo"
          className="max-md:h-56"
        />
        <PhotoTile
          src={displayImages[1]}
          alt="Restaurant gallery photo"
          className="max-md:h-56"
        />
        <div className="relative col-span-2 overflow-hidden rounded max-md:col-span-1 max-md:h-56">
          <PhotoTile
            src={displayImages[2]}
            alt="Restaurant gallery photo"
            className="absolute inset-0"
          />
        </div>
      </div>
    </section>
  );
}

function EditablePhotoGrid({
  galleryImages,
  heroImage,
  onAddGallery,
  onChangeGalleryImage,
  onChangeHero,
}: {
  galleryImages: string[];
  heroImage: string;
  onAddGallery: (files: FileList | null) => void;
  onChangeGalleryImage: (index: number, file: File | undefined) => void;
  onChangeHero: (file: File | undefined) => void;
}) {
  const canAddGalleryImages = galleryImages.length < maxGalleryImages;
  const displayImages = [
    galleryImages[0] || fallbackGalleryImages[0],
    galleryImages[1] || fallbackGalleryImages[1],
    galleryImages[2] || fallbackGalleryImages[2],
  ];
  const extraCount = Math.max(galleryImages.length - 3, 0);

  return (
    <div className="grid h-[386px] grid-cols-4 grid-rows-2 gap-3 max-md:h-auto max-md:grid-cols-1 max-md:grid-rows-none">
      <div
        aria-label="Current hero photo"
        className="relative col-span-2 row-span-2 overflow-hidden rounded-lg bg-cover bg-center max-md:col-span-1 max-md:h-[260px]"
        role="img"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c1b]/60 to-[#1a1c1b]/0" />
        <label className="absolute bottom-6 left-6 inline-flex cursor-pointer items-center gap-2 rounded border border-white/30 bg-[#f9f9f6]/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md font-manrope">
          <Camera className="size-3.5" />
          Change Hero Photo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => onChangeHero(event.target.files?.[0])}
          />
        </label>
      </div>
      <label
        aria-disabled={!canAddGalleryImages}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e4beba4d] bg-[#eeeeeb] text-[#5a6053] transition-colors max-md:h-40 ${
          canAddGalleryImages
            ? "cursor-pointer hover:bg-[#e8e8e5]"
            : "cursor-not-allowed opacity-60"
        }`}
      >
        <Plus className="size-6" />
        <span className="text-[10px] font-bold uppercase tracking-[1px] font-manrope">
          {canAddGalleryImages ? "画像を追加" : "3 / 3"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={!canAddGalleryImages}
          onChange={(event) => onAddGallery(event.target.files)}
        />
      </label>
      {[0, 1].map((index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded max-md:h-40"
        >
          <PhotoTile
            src={displayImages[index]}
            alt="Gallery food photo"
            className="absolute inset-0"
          />
          {galleryImages[index] ? (
            <label className="absolute right-3 top-3 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#5a6053] shadow-sm backdrop-blur-[1px] transition-colors hover:bg-white">
              <Camera className="size-4" />
              <span className="sr-only">Change gallery photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) =>
                  onChangeGalleryImage(index, event.target.files?.[0])
                }
              />
            </label>
          ) : null}
        </div>
      ))}
      <div className="relative overflow-hidden rounded max-md:h-40">
        <PhotoTile
          src={displayImages[2]}
          alt="Gallery food photo"
          className="absolute inset-0"
        />
        {galleryImages[2] ? (
          <label className="absolute right-3 top-3 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#5a6053] shadow-sm backdrop-blur-[1px] transition-colors hover:bg-white">
            <Camera className="size-4" />
            <span className="sr-only">Change gallery photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) =>
                onChangeGalleryImage(2, event.target.files?.[0])
              }
            />
          </label>
        ) : null}
        {extraCount > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1c1b]/45">
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-sm font-bold text-[#1a1c1b] shadow-lg font-jp">
              <Plus className="size-4 text-[#af111c]" />
              {extraCount}枚 もっと見る
            </span>
          </div>
        ) : null}
      </div>
    </div>
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
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            className="size-1.5 rounded-full"
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

function MenuCard({ item }: { item: MenuDisplayItem }) {
  return (
    <article className="relative isolate flex min-h-[216px] overflow-hidden rounded-lg border border-[#e4beba1a] bg-white shadow-sm max-md:flex-col">
      {item.soldOut ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/55">
          <span className="rounded-xl border border-[#8f6f6c]/50 bg-white/95 px-6 py-2 text-base font-bold tracking-[1.6px] text-[#5b403d] shadow-sm font-jp">
            売り切れ / Out of Stock
          </span>
        </div>
      ) : null}
      <div className={`w-[34%] min-w-40 bg-cover bg-center max-md:h-52 max-md:w-full ${item.soldOut ? "opacity-60 grayscale" : ""}`} style={{ backgroundImage: `url(${item.image})` }} />
      <div className={`flex flex-1 flex-col justify-between p-6 ${item.soldOut ? "opacity-45 grayscale" : ""}`}>
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
          {item.criteria.length > 0 ? (
            item.criteria.map((criterion, index) => (
              <DotScale
                key={`${item.itemId}-${criterion.criterionName}-${index}`}
                label={criterion.criterionName}
                value={criterion.ratingLevel}
                color={index % 2 === 0 ? "#af111c" : "#3d5f46"}
              />
            ))
          ) : (
            <span className="text-[11px] font-medium text-[#8a8d85] font-jp">
              評価項目はまだありません。
            </span>
          )}
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

function ReviewCard({ review }: { review: ReviewDisplayItem }) {
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

function MenuSection({
  categories,
  items,
}: {
  categories: MenuCategoryDisplayItem[];
  items: MenuDisplayItem[];
}) {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.code ?? "main",
  );
  const selectedCategory = categories.some(
    (category) => category.code === activeCategory,
  )
    ? activeCategory
    : categories[0]?.code ?? "main";
  const visibleItems = items.filter(
    (item) => (item.categoryCode || "uncategorized") === selectedCategory,
  ).slice(0, 4);

  return (
    <section className="mx-auto flex max-w-[1280px] flex-col gap-12 px-8 py-20 max-md:px-4">
      <div className="flex items-center justify-between gap-6 max-lg:flex-col max-lg:items-start">
        <h2 className="text-3xl font-bold leading-9 tracking-[-0.75px] text-[#1a1c1b] font-brand max-md:text-2xl">
          おすすめメニュー / Recommended Menu
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category.code === selectedCategory;

            return (
              <button
                key={category.code}
                type="button"
                onClick={() => setActiveCategory(category.code)}
                className={`rounded-xl px-4 py-2 text-sm font-medium leading-5 transition-colors font-jp ${
                  isActive
                    ? "bg-[#1a1c1b] text-[#f9f9f6]"
                    : "bg-[#e8e8e5] text-[#5b403d] hover:bg-[#dededb]"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {visibleItems.map((item) => (
          <MenuCard key={item.nameJp} item={item} />
        ))}
        {visibleItems.length === 0 ? (
          <div className="rounded-lg border border-[#e4beba33] bg-white px-5 py-8 text-sm text-[#5a6053] font-jp lg:col-span-2">
            このカテゴリーのメニューはまだありません。
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CommunityReviewsSection({
  items,
}: {
  items: ReviewDisplayItem[];
}) {
  const [audienceFilter, setAudienceFilter] = useState<
    "all" | "japanese" | "vietnamese"
  >("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const audienceOptions = [
    { value: "all", label: "すべて" },
    { value: "japanese", label: "在住日本人" },
    { value: "vietnamese", label: "ベトナム人" },
  ] as const;
  const filteredItems = items.filter((item) => {
    const matchesAudience =
      audienceFilter === "all" || item.audience === audienceFilter;
    const matchesRating =
      ratingFilter === "all" || item.rating === ratingFilter;

    return matchesAudience && matchesRating;
  });
  const allReviewCount = items.length;
  const allAverageRating =
    allReviewCount > 0
      ? items.reduce((sum, item) => sum + item.rating, 0) / allReviewCount
      : 0;

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
            <StarRating rating={Math.round(allAverageRating)} size="size-5" />
            <p className="text-sm font-bold leading-5 text-[#5b403d] font-jp">
              {allAverageRating.toFixed(1)} ({allReviewCount}件のレビュー)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6 rounded-lg border border-[#e4beba1a] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium uppercase tracking-[1.2px] text-[#5a6053] font-jp">
              絞り込み:
            </span>
            {audienceOptions.map((option) => {
              const isActive = option.value === audienceFilter;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAudienceFilter(option.value)}
                  className={`rounded px-3 py-1.5 text-xs font-medium leading-4 transition-colors font-jp ${
                    isActive
                      ? "bg-[#af111c] text-white"
                      : "bg-[#e8e8e5] text-[#5b403d] hover:bg-[#dededb]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="h-6 w-px bg-[#e4beba33] max-sm:hidden" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[1.2px] text-[#5a6053] font-jp">
              評価:
            </span>
            <div className="relative">
              <select
                value={ratingFilter}
                onChange={(event) => {
                  const value = event.target.value;
                  setRatingFilter(value === "all" ? "all" : Number(value));
                }}
                className="appearance-none rounded bg-[#e8e8e5] py-1.5 pl-3 pr-9 text-xs font-medium leading-4 text-[#1a1c1b] outline-none transition-colors hover:bg-[#dededb] focus:ring-1 focus:ring-[#af111c] font-jp"
              >
                <option value="all">すべての評価</option>
                <option value="5">5つ星</option>
                <option value="4">4つ星</option>
                <option value="3">3つ星</option>
                <option value="2">2つ星</option>
                <option value="1">1つ星</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-[#5a6053]" />
            </div>
          </div>
        </div>
        <div className="grid gap-6 pb-4 lg:grid-cols-3">
          {filteredItems.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
          {filteredItems.length === 0 ? (
            <div className="rounded-lg border border-[#e4beba33] bg-white px-5 py-8 text-sm text-[#5a6053] font-jp lg:col-span-3">
              条件に一致するレビューはありません。
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded bg-[#f4f4f1] px-4 py-3 text-sm leading-5 text-[#1a1c1b] outline-none transition-shadow focus:ring-1 focus:ring-[#af111c] font-manrope";

function normalizeSocialUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const phonePattern = /^\d{4}-\d{3}-\d{3}$/;

function isValidPhone(value: string) {
  return phonePattern.test(value.trim());
}

function isValidOptionalUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  try {
    const url = new URL(normalizeSocialUrl(trimmed));
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

function EditRestaurantModal({
  fields,
  galleryImages,
  heroImage,
  onClose,
  onSaved,
}: {
  fields: typeof formFields;
  galleryImages: string[];
  heroImage: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [formValues, setFormValues] = useState(fields);
  const [heroPreview, setHeroPreview] = useState(heroImage);
  const [galleryPreviews, setGalleryPreviews] = useState(
    galleryImages.slice(0, maxGalleryImages),
  );
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<
    Array<{ previewUrl: string; file: File }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof typeof formFields, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeHeroImage(file: File | undefined) {
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setHeroFile(file);
    setHeroPreview(previewUrl);
  }

  function addGalleryImages(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = Math.max(maxGalleryImages - galleryPreviews.length, 0);
    const acceptedFiles = selectedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length === 0) {
      return;
    }

    const acceptedUploads = acceptedFiles.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setGalleryFiles((current) => [...current, ...acceptedUploads]);
    setGalleryPreviews((current) => [
      ...current,
      ...acceptedUploads.map((upload) => upload.previewUrl),
    ]);
  }

  function changeGalleryImage(index: number, file: File | undefined) {
    if (!file) {
      return;
    }

    const previousPreview = galleryPreviews[index];

    if (!previousPreview) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setGalleryFiles((files) => [
      ...files.filter((entry) => entry.previewUrl !== previousPreview),
      { previewUrl, file },
    ]);
    setGalleryPreviews((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index ? previewUrl : image,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (
      !isValidPhone(formValues.phone) ||
      !isValidOptionalUrl(formValues.instagram) ||
      !isValidOptionalUrl(formValues.facebook)
    ) {
      showErrorToast(OWNER_TOAST_MESSAGES.validationError);
      return;
    }

    setIsSaving(true);

    try {
      const [uploadedHero, uploadedGalleryItems] = await Promise.all([
        heroFile ? uploadOwnerRestaurantImage(heroFile) : Promise.resolve(null),
        Promise.all(
          galleryFiles.map(async (entry) => ({
            previewUrl: entry.previewUrl,
            imageUrl: (await uploadOwnerRestaurantImage(entry.file)).imageUrl,
          })),
        ),
      ]);
      const savedHeroImage = uploadedHero?.imageUrl ?? heroImage;
      const uploadedGalleryMap = new Map(
        uploadedGalleryItems.map((item) => [item.previewUrl, item.imageUrl]),
      );
      const savedGalleryImages = galleryPreviews
        .map((image) => uploadedGalleryMap.get(image) ?? image)
        .filter((image) => !image.startsWith("blob:"))
        .slice(0, maxGalleryImages);
      const socialLinks = [
        {
          provider: "Instagram" as const,
          url: normalizeSocialUrl(formValues.instagram),
          displayLabel: "Instagram",
          sortOrder: 0,
          isActive: true,
        },
        {
          provider: "Facebook" as const,
          url: normalizeSocialUrl(formValues.facebook),
          displayLabel: "Facebook",
          sortOrder: 1,
          isActive: true,
        },
      ].filter((link) => link.url);

      await updateOwnerRestaurant({
        nameJp: formValues.name,
        address: formValues.address,
        descriptionVn: formValues.descriptionVn,
        descriptionJp: formValues.descriptionJp,
        phone: formValues.phone,
        openingHours: formValues.hours,
        media: [
          { mediaUrl: savedHeroImage, mediaType: "Cover", sortOrder: 0 },
          ...savedGalleryImages.map((mediaUrl, index) => ({
            mediaUrl,
            mediaType: "Photo" as const,
            sortOrder: index + 1,
          })),
        ],
        socialLinks,
      });
      await onSaved();
      showSuccessToast();
      onClose();
    } catch {
      showErrorToast();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1a1c1b]/40 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-restaurant-title"
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[896px] flex-col overflow-hidden rounded-lg bg-[#f9f9f6] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
      >
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

            <EditablePhotoGrid
              galleryImages={galleryPreviews}
              heroImage={heroPreview}
              onAddGallery={addGalleryImages}
              onChangeGalleryImage={changeGalleryImage}
              onChangeHero={changeHeroImage}
            />
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-8">
              <Field label="店名">
                <input
                  className={`${inputClass} text-lg font-bold leading-7 font-brand`}
                  value={formValues.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </Field>
              <Field label="説明 (ベトナム語)">
                <textarea
                  className={`${inputClass} min-h-[80px] resize-none leading-[22px]`}
                  value={formValues.descriptionVn}
                  onChange={(event) =>
                    updateField("descriptionVn", event.target.value)
                  }
                />
              </Field>
              <Field label="説明 (日本語)">
                <textarea
                  className={`${inputClass} min-h-[102px] resize-none leading-[22px] font-jp`}
                  value={formValues.descriptionJp}
                  onChange={(event) =>
                    updateField("descriptionJp", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="flex flex-col gap-8">
              <Field label="住所">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-[#af111c]" />
                  <input
                    className={`${inputClass} pl-11`}
                    value={formValues.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                  />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="電話番号">
                  <input
                    className={inputClass}
                    value={formValues.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                  />
                </Field>
                <Field label="Operating Hours / 営業時間">
                  <input
                    className={inputClass}
                    value={formValues.hours}
                    onChange={(event) =>
                      updateField("hours", event.target.value)
                    }
                  />
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
                      value={formValues.instagram}
                      onChange={(event) =>
                        updateField("instagram", event.target.value)
                      }
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
                      value={formValues.facebook}
                      onChange={(event) =>
                        updateField("facebook", event.target.value)
                      }
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
              type="submit"
              disabled={isSaving}
              className="min-w-[140px] rounded bg-[linear-gradient(169deg,#af111c_0%,#d32f31_100%)] px-7 py-2.5 text-sm font-bold leading-5 tracking-[0.4px] text-white shadow-[0_10px_15px_-3px_rgba(175,17,28,0.2),0_4px_6px_-4px_rgba(175,17,28,0.2)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 font-jp"
            >
              {isSaving ? "保存中..." : "保存する"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function OwnerHomePage() {
  const [homeData, setHomeData] = useState<OwnerHomeResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  const refreshOwnerHome = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingHome(true);
    }

    try {
      const response = await getOwnerHome();
      setHomeData(response);
    } catch (error) {
      showErrorToast();
      throw error;
    } finally {
      if (showLoading) {
        setIsLoadingHome(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setIsLoadingHome(true);

      try {
        const response = await getOwnerHome();

        if (!cancelled) {
          setHomeData(response);
        }
      } catch {
        if (!cancelled) {
          showErrorToast();
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHome(false);
        }
      }
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  const restaurant = homeData?.restaurant;
  const { coverImage, galleryImages } = useMemo(
    () => buildRestaurantImages(restaurant),
    [restaurant],
  );
  const displayGalleryImages =
    galleryImages.length > 0
      ? galleryImages
      : fallbackGalleryImages;
  const mapImage = photos.map;
  const googleMapsUrl = buildGoogleMapsUrl(restaurant);
  const dynamicInfoItems = useMemo(() => buildInfoItems(homeData), [homeData]);
  const dynamicFeatures = useMemo(() => buildFeatures(homeData), [homeData]);
  const editFields = useMemo(() => buildEditFields(homeData), [homeData]);
  const dynamicMenuItems = useMemo(
    () => toMenuDisplayItems(homeData?.menu.items ?? []),
    [homeData]
  );
  const dynamicMenuCategories = useMemo(
    () => toMenuCategories(homeData?.menu.categories, dynamicMenuItems),
    [dynamicMenuItems, homeData?.menu.categories]
  );
  const dynamicReviews = useMemo(
    () => toReviewDisplayItems(homeData?.reviews.items ?? []),
    [homeData]
  );

  return (
    <main className="min-h-screen bg-[#f9f9f6] pb-12">
      <div className="relative z-0 mb-10">
        <RestaurantPhotoGrid
          galleryImages={displayGalleryImages}
          heroImage={coverImage}
          isVerified={homeData?.badges.isVerified ?? false}
        />
      </div>

      <section className="relative z-20 mx-auto w-[calc(100%-64px)] max-w-[1280px] rounded-lg border border-[#e4beba1a] bg-white p-10 shadow-[0_20px_25px_-5px_rgba(26,28,27,0.05),0_8px_10px_-6px_rgba(26,28,27,0.05)] max-md:w-[calc(100%-32px)] max-md:p-6">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium uppercase tracking-[1.4px] text-[#3d5f46] font-jp">
                伝統的なベトナム料理
              </p>
              <h1 className="text-5xl font-extrabold leading-none tracking-[-2.4px] text-[#1a1c1b] font-brand max-md:text-4xl">
                {restaurant?.nameVn || "Hoang Yen Cuisine"}
              </h1>
              {isLoadingHome ? (
                <span className="w-fit rounded-full bg-[#eeeeeb] px-3 py-1 text-[11px] font-semibold text-[#5a6053]">
                  Loading API data
                </span>
              ) : null}
              <p className="text-lg font-medium leading-7 text-[#5a6053] font-jp">
                {restaurant?.nameJp || "ホアン・イェン・キュイジーヌ"}
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              {dynamicInfoItems.map((item) => {
                const Icon = item.icon;

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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex w-fit items-center gap-2 rounded-md border-2 border-[#d32f2f] px-[18px] py-2.5 text-sm font-bold text-[#d32f2f] transition-colors hover:bg-[#d32f2f]/5 font-jp"
            >
              <PencilLine className="size-3.5" />
              店舗情報を編集
            </button>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-[#e4beba33] bg-[#e8e8e5] shadow-inner max-lg:min-h-[260px]">
            <div
              aria-label="Map near Hoang Yen Cuisine"
              className="absolute inset-0 bg-cover bg-center opacity-90 saturate-50"
              role="img"
              style={{ backgroundImage: `url(${mapImage})` }}
            />
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute left-1/2 top-[62px] flex -translate-x-1/2 flex-col items-center">
              <div className="rounded border-2 border-white bg-[#d32f2f] px-4 py-2 text-[11px] font-bold leading-none text-white shadow-[0_0_0_4px_rgba(211,47,47,0.2),0_20px_25px_-5px_rgba(0,0,0,0.1)]">
                {restaurant?.nameVn || "Takumi Japanese Restaurant"}
              </div>
              <div className="mt-3 flex size-14 items-center justify-center rounded-xl border-4 border-white bg-[#d32f2f] text-white shadow-2xl">
                <Utensils className="size-7" />
              </div>
              <div className="h-4 w-1.5 bg-[#d32f2f] shadow-md" />
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-md border border-[#e4beba4d] bg-white px-2.5 py-2 text-xs font-bold text-[#5b403d] shadow-md font-jp"
            >
              <ExternalLink className="size-3" />
              Google Mapで開く
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-[#e4beba1a] pt-10">
          <div className="grid gap-8 md:grid-cols-3">
            {dynamicFeatures.map((feature) => {
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
      <MenuSection categories={dynamicMenuCategories} items={dynamicMenuItems} />
      <CommunityReviewsSection
        items={dynamicReviews}
      />
      {isEditModalOpen ? (
        <EditRestaurantModal
          fields={editFields}
          galleryImages={displayGalleryImages}
          heroImage={coverImage}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={() => refreshOwnerHome(false)}
        />
      ) : null}
    </main>
  );
}
