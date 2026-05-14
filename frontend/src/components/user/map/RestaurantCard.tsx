import Link from "next/link";
import { BadgeCheck, Map, ShieldCheck, Star } from "lucide-react";
import type { MapRestaurant } from "./map-data";

type RestaurantCardProps = {
  restaurant: MapRestaurant;
  variant?: "grid" | "compact";
  isActive?: boolean;
  onMapOpen?: (restaurant: MapRestaurant) => void;
};

export function RestaurantCard({
  restaurant,
  variant = "grid",
  isActive = false,
  onMapOpen,
}: RestaurantCardProps) {
  const isCompact = variant === "compact";

  return (
    <article
      className={`overflow-hidden bg-white ${
        isCompact
          ? `rounded-2xl border p-[17px] ${
              isActive
                ? "border-2 border-[#d32f2f] bg-[#d32f2f0d] p-[18px] shadow-[0_0_0_1px_rgba(211,47,47,0.2),0_1px_2px_rgba(0,0,0,0.05)]"
                : "border-[rgba(228,190,186,0.3)]"
            }`
          : "rounded-t-lg"
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          isCompact ? "h-56 rounded-lg" : "h-[256px]"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant.imageUrl})` }}
        />
        {restaurant.isVerified ? (
          <div
            className={`absolute left-3 top-3 flex items-center gap-1 bg-[#d32f2f] px-2 py-1 font-jp text-[10px] font-medium leading-[15px] text-white ${
              isCompact ? "rounded-sm tracking-[1px]" : "rounded"
            }`}
          >
            <BadgeCheck className="size-3" />
            認証済み
          </div>
        ) : null}
        <div
          className={`absolute flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white backdrop-blur-[6px] ${
            isCompact ? "bottom-3 right-3" : "bottom-4 left-4"
          }`}
        >
          <Star className="size-2.5 fill-white text-white" />
          <span className="font-manrope text-[10px] font-bold leading-[15px]">
            {restaurant.rating}
          </span>
        </div>
        {isCompact ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 font-manrope text-[10px] font-bold leading-[15px] text-white backdrop-blur-[6px]">
            {restaurant.distanceValue}
          </div>
        ) : null}
      </div>

      <div className={`flex flex-col justify-between ${isCompact ? "pt-4" : "p-6"}`}>
        <div className="flex flex-col gap-4">
          <div
            className={`flex gap-3 ${
              isCompact ? "items-start justify-between" : "flex-col"
            }`}
          >
            <div className="min-w-0">
              <h3
                className={`font-brand font-bold text-[#1a1c1b] ${
                  isCompact
                    ? "line-clamp-2 text-[20px] leading-[25px]"
                    : "text-[20px] leading-7"
                }`}
              >
                {isCompact ? restaurant.mapName : restaurant.name}
              </h3>
              <p
                className={`mt-1 font-manrope text-[12px] ${
                  isCompact
                    ? "font-normal leading-4 text-[#5b403d]"
                    : "font-medium uppercase leading-4 tracking-[0.6px] text-[#5a6053]"
                }`}
              >
                {isCompact ? restaurant.address : restaurant.distance}
              </p>
            </div>
            {isCompact ? (
              <div className="flex shrink-0 items-center gap-1 text-[#d32f2f]">
                <Star className="size-4 fill-[#d32f2f] text-[#d32f2f]" />
                <span className="font-manrope text-[16px] font-bold leading-6">
                  {restaurant.rating}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.badges.map((badge) => (
              <span
                key={badge}
                className={`inline-flex items-center gap-1 font-bold ${
                  isCompact
                    ? "rounded-sm border border-[#3d5f461a] bg-[#3d5f460d] px-[9px] py-[3px] font-jp text-[10px] leading-[15px] text-[#3d5f46]"
                    : "rounded-full bg-[#dfe5d4] px-2 py-1 font-manrope text-[10px] leading-[15px] text-[#606659]"
                }`}
              >
                <ShieldCheck className="size-3" />
                {badge}
              </span>
            ))}
          </div>

          {!isCompact ? (
            <div className="grid grid-cols-2 gap-3">
              {restaurant.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#5a6053]" />
                  <span className="font-jp text-[12px] font-medium leading-4 text-[#5a6053]">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div
          className={`mt-6 flex items-center gap-3 border-t border-[rgba(228,190,186,0.1)] pt-[17px] ${
            isCompact ? "" : ""
          }`}
        >
          <Link
            href={`/user/restaurants/${restaurant.id}`}
            className="flex min-w-0 flex-1 items-center justify-center rounded-md bg-[#af111c] px-4 py-3 font-jp text-[14px] font-medium leading-5 text-white"
          >
            詳細を見る
          </Link>
          <button
            type="button"
            aria-label="Open map"
            className={`flex size-12 shrink-0 items-center justify-center rounded-md border text-[#af111c] ${
              isActive
                ? "border-[#d32f2f] bg-white"
                : "border-[rgba(228,190,186,0.3)]"
            }`}
            onClick={() => onMapOpen?.(restaurant)}
          >
            <Map className="size-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
