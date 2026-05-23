"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  PencilLine,
  Send,
  Star,
  Ticket,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/lib/app-toast";
import { createRestaurantReview } from "@/lib/api/restaurants/API";
import type { OwnerHomeResponse } from "@/lib/api/owner-home/type";
import type { PublicRestaurantPromotion } from "@/lib/api/restaurants/type";
import { getAuthSession, readCachedAuthSession } from "@/lib/api/auth/session";
import type { MeResponse } from "@/lib/api/auth/type";
import {
  isRealCustomerSession,
  redirectToLogin,
} from "@/lib/api/auth/login-redirect";
import { fallbackGalleryImages } from "./restaurant-detail-assets";
import {
  buildFeatures,
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsUrl,
  buildInfoItems,
  buildRestaurantImages,
  toMenuCategories,
  toMenuDisplayItems,
  toReviewDisplayItems,
  type MenuDisplayItem,
  type ReviewDisplayItem,
  type ReviewSummary,
} from "./restaurant-detail-utils";

type RestaurantDetailContentProps = {
  homeData: OwnerHomeResponse;
  canEdit?: boolean;
  adminReadOnly?: boolean;
  onEdit?: () => void;
};

function canSessionComment(session: MeResponse | null) {
  return session?.account.role === "User";
}

function getSessionDisplayName(session: MeResponse | null) {
  if (!session) {
    return "Guest";
  }

  return (
    session.profile?.displayName ||
    session.profile?.fullName ||
    session.account.email
  );
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
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: imagePosition,
      }}
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
                level <= value
                  ? color
                  : color === "#af111c"
                    ? "#f0d8da"
                    : "#d8e1d7",
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
      <div
        className={`w-[34%] min-w-40 bg-cover bg-center max-md:h-52 max-md:w-full ${item.soldOut ? "opacity-60 grayscale" : ""}`}
        style={{ backgroundImage: `url(${item.image})` }}
      />
      <div
        className={`flex flex-1 flex-col justify-between p-6 ${item.soldOut ? "opacity-45 grayscale" : ""}`}
      >
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
            <p
              className={`shrink-0 text-base font-medium leading-6 font-jp ${item.soldOut ? "text-[#5b403d]/50 line-through" : "text-[#af111c]"}`}
            >
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

function MenuSection({
  categories,
  items,
}: {
  categories: Array<{ code: string; label: string }>;
  items: MenuDisplayItem[];
}) {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.code ?? "main",
  );
  const selectedCategory = categories.some(
    (category) => category.code === activeCategory,
  )
    ? activeCategory
    : (categories[0]?.code ?? "main");
  const visibleItems = items
    .filter(
      (item) => (item.categoryCode || "uncategorized") === selectedCategory,
    )
    .slice(0, 4);

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
          <MenuCard key={item.itemId} item={item} />
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

function StarRating({
  rating,
  size = "size-3.5",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div
      className="flex items-center gap-0.5 text-[#f5a400]"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((score) => (
        <Star
          key={score}
          className={`${size} ${score <= rating ? "fill-current" : ""}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewDisplayItem }) {
  return (
    <article className="flex min-h-[240px] flex-col rounded-lg border border-[#e4beba1a] bg-white p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-start">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-medium font-jp ${review.avatarClass}`}
        >
          {review.initial}
        </div>
        <div className="min-w-0 pl-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium leading-5 text-[#1a1c1b] font-jp">
              {review.name}
            </h3>
            <span
              className={`rounded-sm border px-2 py-0.5 text-[10px] font-medium leading-[15px] font-jp ${review.typeClass}`}
            >
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

function CommunityReviewsSection({
  items,
  summary,
}: {
  items: ReviewDisplayItem[];
  summary?: ReviewSummary;
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
  const allReviewCount = summary?.visibleCount ?? 0;
  const allAverageRating = summary?.averageRating ?? 0;

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
            <ReviewCard key={review.id} review={review} />
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

function formatOfferDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function OffersSection({ offers }: { offers: PublicRestaurantPromotion[] }) {
  const [isApplied, setIsApplied] = useState(false);
  const offer = offers[0];

  if (!offer) {
    return null;
  }

  const title = offer.titleJp || offer.titleVn;
  const description = offer.contentJp || offer.contentVn || title;
  const terms = offer.termsJp || offer.termsVn;
  const endDate = formatOfferDate(offer.endDate);
  const meta = [
    offer.targetAudience ? `対象: ${offer.targetAudience}` : "対象: 全ユーザー",
    endDate ? `期間: ${endDate}まで` : null,
    terms,
  ].filter(Boolean);

  return (
    <section className="mx-auto w-[calc(100%-64px)] max-w-[1280px] pt-12 max-md:w-[calc(100%-32px)]">
      <div className="flex items-center justify-between gap-6 rounded-2xl border-2 border-dashed border-[#ffb3ad] bg-[#fff9f9] p-6 max-md:flex-col max-md:items-start">
        <div className="flex min-w-0 items-center">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#af111c] text-white">
            <Ticket className="size-6" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 pl-4">
            <h2 className="text-lg font-bold leading-7 text-[#af111c] font-manrope">
              {title}
            </h2>
            <p className="text-sm font-medium leading-[22.75px] text-[#5a6053] font-jp">
              {description}
            </p>
            {meta.length > 0 ? (
              <p className="text-[10px] font-medium uppercase leading-4 tracking-[0.5px] text-[#5a6053] font-jp">
                {meta.join(", ")}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsApplied(true)}
          className={`min-w-[164px] rounded px-6 py-3 text-base font-medium leading-6 text-white transition-colors font-jp max-md:w-full ${
            isApplied ? "bg-[#3d5f46]" : "bg-[#af111c] hover:bg-[#980f19]"
          }`}
        >
          {isApplied ? "適用済み" : "利用する"}
        </button>
      </div>
    </section>
  );
}

function CommentComposer({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [session, setSession] = useState<MeResponse | null>(
    () => readCachedAuthSession() ?? null,
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canComment = canSessionComment(session);
  const displayName = getSessionDisplayName(session);
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "G";

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const nextSession = await getAuthSession();

      if (!cancelled) {
        setSession(nextSession);
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    const trimmed = comment.trim();

    if (!canComment || !trimmed || isSubmitting) {
      if (!canComment) {
        redirectToLogin(router);
      }

      return;
    }

    setIsSubmitting(true);

    try {
      await createRestaurantReview(restaurantId, {
        rating,
        content: trimmed,
        isJapaneseTag: true,
      });
      setRating(5);
      setComment("");
      showSuccessToast("レビューを投稿しました。");
      router.refresh();
    } catch {
      showErrorToast("レビューの投稿に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-[#f4f4f1] pb-20">
      <div className="mx-auto max-w-[1280px] px-8 max-md:px-4">
        <div className="rounded-lg border border-[#e4beba1a] bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f4f4f1] text-[#5a6053] font-manrope">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-5 text-[#1a1c1b] font-jp">
                {canComment ? displayName : "Guest"}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => {
                      if (!canComment) {
                        redirectToLogin(router);
                        return;
                      }

                      setRating(score);
                    }}
                    aria-label={`${score} stars`}
                    className="text-[#f5a400]"
                  >
                    <Star
                      className={`size-4 ${score <= rating ? "fill-current" : ""}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-3 max-md:flex-col">
            <textarea
              value={comment}
              readOnly={!canComment}
              onChange={(event) => setComment(event.target.value)}
              onFocus={() => {
                if (!canComment) {
                  redirectToLogin(router);
                }
              }}
              placeholder={
                canComment
                  ? "コメントを追加..."
                  : "ログイン済みのユーザーのみコメントできます。"
              }
              className="min-h-20 flex-1 resize-none rounded-md border border-[#e4beba33] bg-[#f9f9f6] px-4 py-3 text-sm leading-6 text-[#1a1c1b] outline-none transition-shadow placeholder:text-[#8a8d85] focus:ring-1 focus:ring-[#af111c] read-only:cursor-pointer read-only:text-[#8a8d85] font-jp max-md:w-full"
            />
            <button
              type="button"
              disabled={canComment && (!comment.trim() || isSubmitting)}
              onClick={handleSubmit}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-md bg-[#af111c] px-4 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 max-md:w-full"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RestaurantDetailContent({
  homeData,
  canEdit = false,
  adminReadOnly = false,
  onEdit,
}: RestaurantDetailContentProps) {
  const router = useRouter();
  const restaurant = homeData.restaurant;
  const { coverImage, galleryImages } = useMemo(
    () => buildRestaurantImages(restaurant),
    [restaurant],
  );
  const displayGalleryImages =
    galleryImages.length > 0 ? galleryImages : fallbackGalleryImages;
  const dynamicInfoItems = useMemo(() => buildInfoItems(homeData), [homeData]);
  const dynamicFeatures = useMemo(() => buildFeatures(homeData), [homeData]);
  const dynamicMenuItems = useMemo(
    () => toMenuDisplayItems(homeData.menu.items ?? []),
    [homeData],
  );
  const dynamicMenuCategories = useMemo(
    () => toMenuCategories(homeData.menu.categories, dynamicMenuItems),
    [dynamicMenuItems, homeData.menu.categories],
  );
  const dynamicReviews = useMemo(
    () => toReviewDisplayItems(homeData.reviews.items ?? []),
    [homeData],
  );
  const promotionItems = homeData.promotions
    .items as PublicRestaurantPromotion[];
  const restaurantName = restaurant.nameVn || restaurant.nameJp || "Restaurant";
  const googleMapsUrl = buildGoogleMapsUrl(restaurant);
  const googleMapsEmbedUrl = buildGoogleMapsEmbedUrl(restaurant);
  const showCustomerActions = !canEdit && !adminReadOnly;

  return (
    <main className="min-h-screen bg-[#f9f9f6] pb-12">
      <div className="relative z-0 mb-10">
        <RestaurantPhotoGrid
          galleryImages={displayGalleryImages}
          heroImage={coverImage}
          isVerified={homeData.badges.isVerified}
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
                {restaurantName}
              </h1>
              <p className="text-lg font-medium leading-7 text-[#5a6053] font-jp">
                {restaurant.nameJp || restaurant.nameVn || "Restaurant"}
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

            {canEdit && onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex w-fit items-center gap-2 rounded-md border-2 border-[#d32f2f] px-[18px] py-2.5 text-sm font-bold text-[#d32f2f] transition-colors hover:bg-[#d32f2f]/5 font-jp"
              >
                <PencilLine className="size-3.5" />
                店舗情報を編集
              </button>
            ) : showCustomerActions ? (
              <Link
                href={`/user/reservations?restaurantId=${homeData.restaurantId}`}
                onClick={async (event) => {
                  event.preventDefault();
                  const href = `/user/reservations?restaurantId=${homeData.restaurantId}`;
                  const session = await getAuthSession();

                  if (isRealCustomerSession(session)) {
                    router.push(href);
                    return;
                  }

                  redirectToLogin(router, href);
                }}
                className="inline-flex min-h-14 w-fit items-center gap-3 rounded-md bg-[#af111c] px-8 py-4 text-base font-bold text-white shadow-[0px_4px_6px_-4px_rgba(175,17,28,0.2),0px_10px_15px_-3px_rgba(175,17,28,0.2)] transition-colors hover:bg-[#980f19] font-jp max-sm:w-full max-sm:justify-center"
              >
                <CalendarCheck className="size-5" />
                定型文で日本語予約 (Booking)
              </Link>
            ) : null}
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-[#e4beba33] bg-[#e8e8e5] shadow-inner max-lg:min-h-[260px]">
            {googleMapsEmbedUrl ? (
              <iframe
                src={googleMapsEmbedUrl}
                title={`Google Map near ${restaurantName}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#e8e8e5] px-6 text-center">
                <p className="text-sm font-medium leading-6 text-[#5a6053] font-jp">
                  åœ°å›³æƒ…å ±ã¯ã¾ã ç™»éŒ²ã•ã‚Œã¦ã„ã¾ã›ã‚“ã€‚
                </p>
              </div>
            )}
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

      {showCustomerActions ? <OffersSection offers={promotionItems} /> : null}
      <MenuSection
        categories={dynamicMenuCategories}
        items={dynamicMenuItems}
      />
      <CommunityReviewsSection
        items={dynamicReviews}
        summary={homeData.reviews.summary}
      />
      {showCustomerActions ? (
        <CommentComposer restaurantId={homeData.restaurantId} />
      ) : null}
    </main>
  );
}
