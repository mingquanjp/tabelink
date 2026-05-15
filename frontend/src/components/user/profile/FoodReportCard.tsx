/* eslint-disable @next/next/no-img-element */
import { MapPin, Star } from "lucide-react";
import type { FoodReport } from "./profile-data";

type FoodReportCardProps = {
  report: FoodReport;
  onOpen?: (report: FoodReport) => void;
};

export function FoodReportCard({ report, onOpen }: FoodReportCardProps) {
  return (
    <button
      type="button"
      className="overflow-hidden rounded-lg border border-[#e8e8e5] bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(26,28,27,0.08)]"
      onClick={() => onOpen?.(report)}
    >
      <div className="h-48 overflow-hidden">
        <img
          src={report.imageUrl}
          alt=""
          className="size-full object-cover"
          draggable={false}
        />
      </div>

      <div className="flex flex-col gap-2 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="min-w-0 font-jp text-lg font-bold leading-7 text-[#1a1c1b]">
            {report.restaurantName}
          </h2>
          <div className="flex shrink-0 items-center gap-1 pt-1">
            <Star className="size-3 fill-[#af111c] text-[#af111c]" />
            <span className="font-jp text-sm font-bold leading-5 text-[#af111c]">
              {report.rating}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <MapPin className="size-3 text-[#5a6053]" />
          <span className="font-jp text-[10px] font-normal uppercase leading-[15px] tracking-[0.5px] text-[#5a6053]">
            {report.location}
          </span>
        </div>

        <p className="border-t border-[rgba(228,190,186,0.1)] pt-4 font-jp text-sm font-normal leading-5 text-[#5a6053]">
          {report.description}
        </p>
      </div>
    </button>
  );
}
