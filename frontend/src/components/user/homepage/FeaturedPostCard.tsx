import { ChevronLeft, ChevronRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  HomepageFeaturedRestaurant,
  HomepagePost,
} from "./homepage-data";

type FeaturedPostCardProps = {
  activeIndex: number;
  items: HomepageFeaturedRestaurant[];
  onOpen: (post: HomepagePost) => void;
  onSelectNext: () => void;
  onSelectPrevious: () => void;
  post: HomepagePost;
};

export function FeaturedPostCard({
  activeIndex,
  items,
  onOpen,
  onSelectNext,
  onSelectPrevious,
  post,
}: FeaturedPostCardProps) {
  const restaurant = items[activeIndex] ?? items[0];

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
        <button
          type="button"
          className="relative block h-[380px] w-full overflow-hidden bg-cover bg-center text-left"
          style={{ backgroundImage: `url(${restaurant.image})` }}
          aria-label="Open featured post"
          onClick={() => onOpen(post)}
        >
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute bottom-6 left-6 right-6">
            <span className="font-manrope text-[10px] font-bold uppercase tracking-[0.8px] text-white/80">
              {restaurant.eyebrow}
            </span>
            <span className="mt-1 block font-jp text-[22px] font-bold leading-7 text-white">
              {restaurant.name}
            </span>
          </span>
        </button>
        <CardContent className="px-4 py-4">
          <p className="font-jp text-[12px] font-medium leading-6 text-[#5a6053]">
            {restaurant.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 font-manrope text-[12px] font-bold text-[#1a1c1b]">
              <Star className="size-3.5 fill-[#af111c] text-[#af111c]" />
              {restaurant.rating} ({restaurant.reviewCount})
            </div>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-full bg-[#f6dbdc] px-4 font-jp text-[12px] text-[#af111c] hover:bg-[#efd0d2]"
              onClick={() => onOpen(post)}
            >
              詳細を見る
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {items.map((item, index) => (
          <span
            key={item.id}
            className={`size-2 rounded-full ${
              index === activeIndex ? "bg-[#af111c]" : "bg-[#e6e2dc]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
