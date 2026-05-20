import { Star } from "lucide-react";

type RatingDotsProps = {
  value: number;
};

export function RatingDots({ value }: RatingDotsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-2.5 ${
            index < value ? "fill-[#af111c] text-[#af111c]" : "text-[#d8d8d2]"
          }`}
        />
      ))}
    </div>
  );
}
