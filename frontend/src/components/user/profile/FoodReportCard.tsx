/* eslint-disable @next/next/no-img-element */
import { UserBlogItem } from "@/lib/api/user-profile/type";
import { MapPin, Star } from "lucide-react";

type FoodReportCardProps = {
  blog: UserBlogItem;
  onOpen?: (blog: UserBlogItem) => void;
};

export function FoodReportCard({ blog, onOpen }: FoodReportCardProps) {
  return (
    <button
      type="button"
      className="overflow-hidden rounded-lg border border-[#e8e8e5] bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(26,28,27,0.08)]"
      onClick={() => onOpen?.(blog)}
    >
      <div className="h-48 overflow-hidden">
        <img src={blog.thumbnailUrl ?? "/default-food.png"}
          className="size-full object-cover"
          draggable={false}
        />
      </div>

      <div className="flex flex-col gap-2 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="min-w-0 font-jp text-lg font-bold leading-7 text-[#1a1c1b]">
            {blog.restaurantName}
          </h2>
          <p className="text-sm">{blog.title}</p>
          <div className="flex shrink-0 items-center gap-1 pt-1">
            <Star className="size-3 fill-[#af111c] text-[#af111c]" />
            <span className="font-jp text-sm font-bold leading-5 text-[#af111c]">
              {blog.rating}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <MapPin className="size-3 text-[#5a6053]" />
          <span className="font-jp text-[10px] font-normal uppercase leading-[15px] tracking-[0.5px] text-[#5a6053]">
            {blog.location}
          </span>
        </div>

        {/* <p className="border-t border-[rgba(228,190,186,0.1)] pt-4 font-jp text-sm font-normal leading-5 text-[#5a6053]">
          {blog.description}
        </p> */}
      </div>
    </button>
  );
}
