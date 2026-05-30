import { Star } from "lucide-react";
import type { AdminBadgeApplication } from "@/lib/api/admin-badges/type";
import { fallbackRestaurantImages } from "./badge-review-data";

type RestaurantSummaryProps = {
  application: AdminBadgeApplication;
};

export function RestaurantSummary({ application }: RestaurantSummaryProps) {
  const restaurant = application.restaurant;
  const restaurantName = restaurant.nameJp || restaurant.nameVn;
  const mainImage = restaurant.mainImageUrl ?? fallbackRestaurantImages.main;
  const rating = restaurant.ratingAverage ?? 0;

  return (
    <div className="flex flex-col justify-between gap-6 border-b border-[#e8e8e5] pb-8 md:flex-row md:items-start">
      <div className="flex items-center gap-6">
        <img
          src={mainImage}
          alt={`${restaurantName} メイン写真`}
          className="size-24 shrink-0 rounded-2xl object-cover shadow-sm"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-brand text-2xl font-bold leading-8 text-[#1a1c1b]">
              {restaurantName}
            </h2>
            <span className="rounded-xl bg-[#c5eccc] px-2 py-1 font-jp text-[10px] font-medium uppercase leading-[15px] tracking-[0.5px] text-[#00210e]">
              プレミアム
            </span>
          </div>
          <p className="font-jp text-sm font-medium leading-5 text-[#5a6053]">
            {restaurant.address}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <span className="flex items-center gap-1 font-manrope text-sm font-bold leading-5 text-[#1a1c1b]">
              <Star className="size-3.5 fill-[#d32f2f] text-[#d32f2f]" />
              {rating.toFixed(1)}
              <span className="font-jp text-xs font-normal leading-4 text-[#5a6053]">
                ({restaurant.reviewCount} 評価)
              </span>
            </span>
            <span className="h-3 w-px bg-[#e8e8e5]" />
            <span className="font-jp text-xs font-bold uppercase leading-4 tracking-[1.2px] text-[#5a6053]">
              {restaurant.issuesVat ? "VAT 対応可" : "VAT 未対応"}
            </span>
          </div>
        </div>
      </div>

      <a
        href={`/admin/restaurants/${restaurant.restaurantId}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded border border-[#e4beba] px-4 font-jp text-sm font-medium leading-5 text-[#1a1c1b] transition-colors hover:bg-[#fff6f5]"
      >
        店舗ページを表示
      </a>
    </div>
  );
}
