import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { HomepageHotRestaurant, HomepageUser } from "./homepage-data";

type HomeLeftSidebarProps = {
  hotRestaurants: HomepageHotRestaurant[];
  user: HomepageUser;
};

function formatCount(value: number | undefined, fallback: string) {
  if (value === undefined) {
    return fallback;
  }

  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }

  return String(value);
}

export function HomeLeftSidebar({ hotRestaurants, user }: HomeLeftSidebarProps) {
  return (
    <aside className="space-y-5 max-md:order-2">
      <Card className="rounded-lg border-0 bg-white py-0 shadow-[0_8px_24px_rgba(26,28,27,0.06)]">
        <CardContent className="px-6 py-6 text-center">
          <div
            className="mx-auto size-[66px] rounded-xl bg-cover bg-center shadow-[0_4px_12px_rgba(26,28,27,0.16)]"
            style={{ backgroundImage: `url(${user.avatarUrl})` }}
          />
          <h1 className="mt-4 font-jp text-[15px] font-bold leading-5 text-[#1a1c1b]">
            {user.name}
          </h1>
          <p className="mt-1 font-jp text-[12px] font-medium leading-4 text-[#5a6053]">
            グルメ・エクスプローラー
          </p>
          <div className="mt-5 grid grid-cols-3 border-t border-[#f0eee8] pt-4 text-center">
            <div>
              <p className="font-manrope text-[14px] font-bold text-[#1a1c1b]">
                {formatCount(user.accountId, "")}
              </p>
              <p className="font-jp text-[9px] text-[#5a6053]">投稿</p>
            </div>
            <div>
              <p className="font-manrope text-[14px] font-bold text-[#1a1c1b]">
                {formatCount(user.followerCount, "1.2k")}
              </p>
              <p className="font-jp text-[9px] text-[#5a6053]">フォロワー</p>
            </div>
            <div>
              <p className="font-manrope text-[14px] font-bold text-[#1a1c1b]">
                {formatCount(user.followingCount, "850")}
              </p>
              <p className="font-jp text-[9px] text-[#5a6053]">フォロー中</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-0 bg-white py-0 shadow-[0_8px_24px_rgba(26,28,27,0.06)]">
        <CardContent className="px-5 py-5">
          <h2 className="font-jp text-[13px] font-bold leading-5 text-[#1a1c1b]">
            今話題のレストラン
          </h2>
          <div className="mt-4 space-y-3">
            {hotRestaurants.map((restaurant) => (
              <div key={restaurant.name} className="flex items-center gap-3">
                <div
                  className="size-10 shrink-0 rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${restaurant.image})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-jp text-[12px] font-bold leading-4 text-[#1a1c1b]">
                    {restaurant.name}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[#af111c]">
                    <Star className="size-3 fill-[#af111c]" />
                    <span className="font-manrope text-[10px] font-bold">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
