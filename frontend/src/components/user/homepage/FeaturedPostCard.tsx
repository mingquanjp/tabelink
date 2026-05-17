"use client";

import { ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HomepageFeaturedRestaurant } from "./homepage-data";
import { useRouter } from "next/navigation";

type FeaturedPostCardProps = {
  activeIndex: number;
  items: HomepageFeaturedRestaurant[];
  onSelectNext: () => void;
  onSelectPrevious: () => void;
};

export function FeaturedPostCard({
  activeIndex,
  items,
  onSelectNext,
  onSelectPrevious,
}: FeaturedPostCardProps) {
  const restaurant = items[activeIndex] ?? items[0];
  const selectedIndex = items[activeIndex] ? activeIndex : 0;
  const router = useRouter();

  if (!restaurant) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-jp text-[13px] font-bold leading-5 text-[#1a1c1b]">
          <Sparkles className="size-4 text-[#af111c]" />
          おすすめのレストラン
        </h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="size-7 rounded-full bg-[#f0eee8] text-[#7a7f74]"
            onClick={onSelectPrevious}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="size-7 rounded-full bg-[#f0eee8] text-[#7a7f74]"
            onClick={onSelectNext}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-lg border-0 bg-white py-0 shadow-[0_8px_24px_rgba(26,28,27,0.06)]">
        <div
          className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
        >
          {items.map((item) => (
            <article key={item.id} className="min-w-full">
              <button
                type="button"
                className="relative block h-[380px] w-full overflow-hidden bg-cover bg-center text-left"
                style={{ backgroundImage: `url(${item.image})` }}
                aria-label={`${item.name} の詳細を見る`}
                onClick={() => router.push(`/user/restaurants/${item.restaurantId}`)}
              >
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-6 left-6 right-6">
                  <span className="font-manrope text-[10px] font-bold uppercase tracking-[0.8px] text-white/80">
                    {item.eyebrow}
                  </span>
                  <span className="mt-1 block font-jp text-[22px] font-bold leading-7 text-white">
                    {item.name}
                  </span>
                </span>
              </button>
              <CardContent className="px-4 py-4">
                <p className="min-h-[48px] font-jp text-[12px] font-medium leading-6 text-[#5a6053]">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-manrope text-[12px] font-bold text-[#1a1c1b]">
                    <Star className="size-3.5 fill-[#af111c] text-[#af111c]" />
                    {item.rating} ({item.reviewCount})
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full bg-[#f6dbdc] px-4 font-jp text-[12px] text-[#af111c] hover:bg-[#efd0d2]"
                    onClick={() =>
                      router.push(`/user/restaurants/${item.restaurantId}`)
                    }
                  >
                    詳細を見る
                  </Button>
                </div>
              </CardContent>
            </article>
          ))}
        </div>
      </Card>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {items.map((item, index) => (
          <span
            key={item.id}
            className={`size-2 rounded-full ${
              index === selectedIndex ? "bg-[#af111c]" : "bg-[#e6e2dc]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
