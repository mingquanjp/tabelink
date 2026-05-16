import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RatingItem, RatingKey } from "./blog-create-data";

type RatingMatrixProps = {
  items: RatingItem[];
  ratings: Record<RatingKey, number>;
  onChange: (key: RatingKey, value: number) => void;
};

export function RatingMatrix({ items, ratings, onChange }: RatingMatrixProps) {
  return (
    <section className="grid grid-cols-1 gap-8 border-y border-[#e4beba33] py-8 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.key} className="flex flex-col items-start gap-3">
          <h2 className="font-manrope text-[10px] font-bold leading-[15px] tracking-[1px] text-[#5a6053]">
            {item.label}
          </h2>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const nextValue = index + 1;
              const active = nextValue <= ratings[item.key];

              return (
                <button
                  key={nextValue}
                  type="button"
                  aria-label={`${item.label} ${nextValue} stars`}
                  onClick={() => onChange(item.key, nextValue)}
                  className="inline-flex size-6 items-center justify-center rounded-sm transition-transform hover:scale-105"
                >
                  <Star
                    className={cn(
                      "size-5 text-[#af111c]",
                      active ? "fill-[#af111c]" : "fill-transparent",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
