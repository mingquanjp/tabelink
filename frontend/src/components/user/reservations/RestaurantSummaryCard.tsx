import { MapPin } from "lucide-react";
import type { OwnerHomeResponse } from "@/lib/api/owner-home/type";
import { buildRestaurantImages } from "@/components/restaurant-detail/restaurant-detail-utils";

type RestaurantSummaryCardProps = {
  homeData: OwnerHomeResponse;
};

function getServiceLabel(restaurant: OwnerHomeResponse["restaurant"]) {
  const feature = restaurant.features.find((item) => {
    const label = `${item.featureNameJp ?? ""} ${item.featureNameVn ?? ""} ${item.featureCode ?? ""}`;

    return /日本|japanese/i.test(label);
  });

  return feature?.featureNameJp || feature?.featureNameVn || null;
}

export function RestaurantSummaryCard({ homeData }: RestaurantSummaryCardProps) {
  const restaurant = homeData.restaurant;
  const restaurantName = restaurant.nameJp || restaurant.nameVn || "レストラン";
  const location = restaurant.address || "住所未設定";
  const { coverImage } = buildRestaurantImages(restaurant);
  const serviceLabel = getServiceLabel(restaurant);

  return (
    <section aria-label="レストラン情報">
      <div className="flex items-center rounded-lg bg-[#f4f4f1] p-6 max-sm:items-start max-sm:p-4">
        <div
          aria-label={restaurantName}
          className="size-24 shrink-0 overflow-hidden rounded bg-[#1f2937] bg-cover bg-center max-sm:size-20"
          role="img"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        <div className="min-w-0 pl-6 max-sm:pl-4">
          <h2 className="truncate font-jp text-2xl font-medium leading-8 text-[#1a1c1b] max-sm:text-lg max-sm:leading-7">
            {restaurantName}
          </h2>
          <div className="mt-1 flex items-center gap-1 text-[#5a6053]">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate font-jp text-base font-medium leading-6 max-sm:text-sm">
              {location}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {homeData.badges.isVerified ? (
              <span className="rounded-sm bg-[#c5eccc] px-2 py-0.5 font-jp text-xs font-medium uppercase leading-4 tracking-[0.6px] text-[#2c4e36]">
                認証済み
              </span>
            ) : null}
            {serviceLabel ? (
              <span className="font-jp text-sm font-medium leading-5 text-[#af111c]">
                {serviceLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
