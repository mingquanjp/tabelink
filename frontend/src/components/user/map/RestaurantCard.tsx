import Link from "next/link";
import { BadgeCheck, Map, ShieldCheck, Star } from "lucide-react";
import type { MapRestaurant } from "./map-data";

type RestaurantCardProps = {
  restaurant: MapRestaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <article className="overflow-hidden rounded-t-lg bg-white">
      <div className="relative h-[256px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant.imageUrl})` }}
        />
        {restaurant.isVerified ? (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded bg-[#d32f2f] px-2 py-1 font-jp text-[10px] font-medium leading-[15px] text-white">
            <BadgeCheck className="size-3" />
            認証済み
          </div>
        ) : null}
        <div className="absolute bottom-4 left-4 flex h-[23px] items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-white backdrop-blur-[6px]">
          <Star className="size-2.5 fill-white text-white" />
          <span className="font-manrope text-[10px] font-normal leading-[15px]">
            {restaurant.rating}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-brand text-[20px] font-bold leading-7 text-[#1a1c1b]">
              {restaurant.name}
            </h3>
            <p className="font-manrope text-[12px] font-medium uppercase leading-4 tracking-[0.6px] text-[#5a6053]">
              {restaurant.distance}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-full bg-[#dfe5d4] px-2 py-1 font-manrope text-[10px] font-bold leading-[15px] text-[#606659]"
              >
                <ShieldCheck className="size-3" />
                {badge}
              </span>
            ))}
          </div>

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
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-[rgba(228,190,186,0.1)] pt-[17px]">
          <Link
            href={`/user/restaurants/${restaurant.id}`}
            className="flex min-w-0 flex-1 items-center justify-center rounded-md bg-[#af111c] px-4 py-3 font-jp text-[14px] font-medium leading-5 text-white"
          >
            詳細を見る
          </Link>
          <button
            type="button"
            aria-label="Open map"
            className="flex size-12 shrink-0 items-center justify-center rounded-md border border-[rgba(228,190,186,0.3)] text-[#af111c]"
          >
            <Map className="size-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
