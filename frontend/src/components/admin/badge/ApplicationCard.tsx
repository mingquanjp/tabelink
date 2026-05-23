import { CalendarDays } from "lucide-react";
import type { AdminBadgeApplication } from "@/lib/api/admin-badges/type";
import { fallbackRestaurantImages } from "./badge-review-data";

type ApplicationCardProps = {
  application: AdminBadgeApplication;
  isActive: boolean;
  onSelect: (application: AdminBadgeApplication) => void;
};

function formatSubmittedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export function ApplicationCard({
  application,
  isActive,
  onSelect,
}: ApplicationCardProps) {
  const restaurantName =
    application.restaurant.nameJp || application.restaurant.nameVn;
  const thumbnail =
    application.restaurant.thumbnailUrl ?? fallbackRestaurantImages.thumbnail;

  return (
    <button
      type="button"
      className={`flex w-full items-start gap-4 rounded-lg text-left transition-colors ${
        isActive
          ? "border-l-4 border-[#d32f2f] bg-white py-4 pl-5 pr-4 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
          : "bg-[#f4f4f1] p-4 hover:bg-[#eeeeeb]"
      }`}
      onClick={() => onSelect(application)}
    >
      <img
        src={thumbnail}
        alt={restaurantName}
        className={`size-16 shrink-0 rounded object-cover ${isActive ? "" : "saturate-50"}`}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-jp text-sm font-bold leading-5 text-[#1a1c1b]">
          {restaurantName}
        </span>
        <span className="flex items-center gap-2 font-manrope text-[10px] font-normal leading-[15px] text-[#5a6053]">
          <CalendarDays className="size-3" strokeWidth={1.7} />
          {formatSubmittedAt(application.submittedAt)}
        </span>
        <span className="mt-1 w-fit max-w-full truncate rounded bg-[#e8e8e5] px-2 py-0.5 font-jp text-[10px] font-medium leading-[15px] text-[#5a6053]">
          {application.restaurant.areaLabel || application.restaurant.address}
        </span>
      </span>
    </button>
  );
}
