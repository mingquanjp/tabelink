import { Clock3, CreditCard, MapPin, Phone, ReceiptText, Share2, UsersRound } from "lucide-react";
import type {
  OwnerHomeMenuItem,
  OwnerHomeResponse,
  OwnerHomeReviewItem,
} from "@/lib/api/owner-home/type";
import { fallbackMenuImages, restaurantDetailPhotos } from "./restaurant-detail-assets";

export type RestaurantInfoItem = {
  label: string;
  value: string;
  icon: typeof MapPin;
  badge?: string;
};

export type RestaurantFeatureItem = {
  eyebrow: string;
  title: string;
  icon: typeof ReceiptText;
};

export type MenuCategoryDisplayItem = {
  code: string;
  label: string;
};

export type MenuDisplayItem = {
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

export type ReviewDisplayItem = {
  id: number;
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

export type ReviewSummary = OwnerHomeResponse["reviews"]["summary"];

const fallbackInfoItems: RestaurantInfoItem[] = [
  {
    label: "住所 / Address",
    value: "7-9 Ngo Duc Ke, Ben Nghe, District 1, HCMC",
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

const fallbackFeatures: RestaurantFeatureItem[] = [
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

export function formatVnd(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export function buildGoogleMapsUrl(
  restaurant: OwnerHomeResponse["restaurant"] | undefined,
) {
  if (!restaurant) {
    return "https://www.google.com/maps";
  }

  if (restaurant.latitude !== null && restaurant.longitude !== null) {
    return `https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`;
  }

  const address = restaurant.address.trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return "https://www.google.com/maps";
}

function withGoogleMapsEmbedOutput(url: string) {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set("output", "embed");
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

export function buildGoogleMapsEmbedUrl(
  restaurant: OwnerHomeResponse["restaurant"] | undefined,
) {
  if (!restaurant) {
    return null;
  }

  if (restaurant.map.embedUrl) {
    return withGoogleMapsEmbedOutput(restaurant.map.embedUrl);
  }

  const query =
    restaurant.latitude !== null && restaurant.longitude !== null
      ? `${restaurant.latitude},${restaurant.longitude}`
      : restaurant.address.trim();

  if (!query) {
    return null;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

function isDisplayableRestaurantImageUrl(url: string | null | undefined) {
  if (!url) {
    return false;
  }

  return /^https?:\/\//i.test(url) || url.startsWith("/");
}

function uniqueImageUrls(urls: string[]) {
  return Array.from(new Set(urls.filter(isDisplayableRestaurantImageUrl)));
}

export function buildRestaurantImages(
  restaurant: OwnerHomeResponse["restaurant"] | null | undefined,
) {
  const sortedMedia = [...(restaurant?.media ?? [])]
    .filter((item) => isDisplayableRestaurantImageUrl(item.mediaUrl))
    .sort(
      (a, b) => a.sortOrder - b.sortOrder || a.mediaId - b.mediaId,
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
    restaurantDetailPhotos.interior;
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

export function buildInfoItems(homeData: OwnerHomeResponse | null): RestaurantInfoItem[] {
  const restaurant = homeData?.restaurant;

  if (!restaurant) {
    return fallbackInfoItems;
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

export function buildFeatures(homeData: OwnerHomeResponse | null): RestaurantFeatureItem[] {
  const restaurant = homeData?.restaurant;

  if (!restaurant) {
    return fallbackFeatures;
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

export function toMenuDisplayItems(items: OwnerHomeMenuItem[]): MenuDisplayItem[] {
  return items.filter((item) => item.isRecommendedForJp).map((item, index) => ({
    itemId: item.itemId,
    categoryCode:
      item.category?.categoryCode ?? item.categoryId?.toString() ?? null,
    categoryName:
      item.category?.categoryNameJp || item.category?.categoryNameVn || null,
    nameJp: item.nameJp || item.nameVn,
    nameVn: item.nameVn,
    price: formatVnd(item.price),
    description: item.descriptionJp || item.descriptionVn || "",
    image: item.imageUrl || fallbackMenuImages[index % fallbackMenuImages.length],
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

export function toMenuCategories(
  categories: OwnerHomeResponse["menu"]["categories"] | undefined,
  items: MenuDisplayItem[],
): MenuCategoryDisplayItem[] {
  const itemCategoryCodes = new Set(
    items.map((item) => item.categoryCode || "uncategorized"),
  );

  if (categories && categories.length > 0) {
    const matchedCategories = categories
      .map((category) => ({
        code: category.categoryCode || category.categoryId.toString(),
        label: category.categoryNameJp || category.categoryNameVn,
      }))
      .filter((category) => itemCategoryCodes.has(category.code));

    if (matchedCategories.length > 0) {
      return matchedCategories;
    }
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

export function toReviewDisplayItems(items: OwnerHomeReviewItem[]): ReviewDisplayItem[] {
  return items.map((item) => {
    const name = item.customerName || `User #${item.customerAccountId}`;
    const initial = name.trim().charAt(0).toUpperCase() || "U";

    return {
      id: item.reviewId,
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
