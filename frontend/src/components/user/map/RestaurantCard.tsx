import { BadgeCheck, Car, Globe, Map, Receipt, ShieldCheck, Star, Utensils } from "lucide-react";
import Link from "next/link";
import type { MapRestaurant } from "./map-data";
import { formatDistanceShort } from "./map-routing";

type RestaurantCardProps = {
  restaurant: MapRestaurant;
  variant?: "grid" | "compact";
  isActive?: boolean;
  onMapOpen?: (restaurant: MapRestaurant) => void;
};

export const FEATURE_MAPPING: Record<string, { label: string; icon: any }> = {
  JAPANESE_MENU: { label: "日本語メニュー", icon: Globe },
  VAT_INVOICE: { label: "VAT発行可", icon: Receipt },
  PARKING: { label: "駐車場あり", icon: Car },
  PRIVATE_ROOM: { label: "個室完備", icon: Utensils },
  TABLE_MANAGEMENT: { label: "席管理", icon: Utensils },
  ONLINE_RESERVATION: { label: "オンライン予約", icon: Map },
};

export function RestaurantCard({
  restaurant,
  variant = "grid",
  isActive = false,
  onMapOpen,
}: RestaurantCardProps) {
  const isCompact = variant === "compact";
  const compactDistance =
    restaurant.routeDistanceMeters !== undefined
      ? formatDistanceShort(restaurant.routeDistanceMeters)
      : restaurant.distanceValue;

  return (
    <article
      className={`flex flex-col h-full overflow-hidden bg-white transition-all ${isCompact
        ? `rounded-2xl border p-[17px] ${isActive
          ? "border-2 border-[#d32f2f] bg-[#d32f2f0d] shadow-sm"
          : "border-[rgba(228,190,186,0.3)]"
        }`
        : "rounded-xl border border-gray-100 shadow-sm hover:shadow-md"
        }`}
    >
      {/* 1. Phần Ảnh */}
      <div className={`relative shrink-0 overflow-hidden ${isCompact ? "h-48 rounded-lg" : "h-[220px] rounded-t-xl"}`}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${restaurant.imageUrl || '/default-restaurant.jpg'})` }}
        />
        {restaurant.isVerified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 bg-[#d32f2f] px-2 py-1 rounded text-[10px] font-bold text-white">
            <BadgeCheck className="size-3" />
            認証済み
          </div>
        )}
        <div
          className={`absolute flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white backdrop-blur-[6px] ${isCompact ? "bottom-3 right-3" : "bottom-4 left-4"
            }`}
        >
          <Star className="size-2.5 fill-white text-white" />
          <span className="font-manrope text-[10px] font-bold leading-[15px]">
            {restaurant.rating}
          </span>
        </div>
      </div>

      {/* 2. Phần Nội dung  */}
      <div className={`flex flex-col flex-1 ${isCompact ? "pt-4" : "p-5"}`}>
        <div className="flex-1">
          <div className="flex flex-col">
            <h3 className="font-brand font-bold text-[#1a1c1b] text-[18px] line-clamp-1">
              {isCompact ? restaurant.mapName : restaurant.name}
            </h3>
            <p className="text-[12px] text-[#5a6053] font-medium uppercase tracking-wider mt-1">
              {isCompact ? `• ${restaurant.address}` : ""}
            </p>
          </div>

          {/* Badges xanh */}
          <div className="flex flex-wrap gap-2 mt-3">
            {restaurant.badges?.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded-full bg-[#dfe5d4] px-2 py-0.5 text-[10px] font-bold text-[#3d5f46]">
                <ShieldCheck className="size-3" />
                {badge}
              </span>
            ))}
          </div>

          {/* Features Grid */}
          {!isCompact && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {restaurant.features
                .map((code) => ({ code, data: FEATURE_MAPPING[code] }))
                .filter((item) => item.data)
                .slice(0, 4)
                .map((item) => {
                  const Icon = item.data!.icon;
                  return (
                    <div key={item.code} className="flex items-center gap-2 bg-[#f9f9f7] p-1.5 rounded-md border border-gray-50">
                      <Icon className="size-3.5 text-[#5a6053]" />
                      <span className="font-jp text-[11px] font-medium text-[#1a1c1b] truncate">
                        {item.data!.label}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* 3. Nút hành động*/}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 shrink-0">
          <Link
            href={`/user/restaurants/${restaurant.id}`}
            className="flex-1 bg-[#af111c] hover:bg-[#8e0e17] text-white py-2.5 rounded-md text-center text-[13px] font-bold transition-colors"
          >
            詳細を見る
          </Link>
          <button
            onClick={() => onMapOpen?.(restaurant)}
            className={`p-2.5 rounded-md border border-gray-200 transition-colors ${isActive ? 'bg-[#af111c] text-white border-[#af111c]' : 'text-[#af111c] hover:bg-gray-50'}`}
          >
            <Map className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
