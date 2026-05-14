import { MapPin } from "lucide-react";
import { restaurantImage } from "./booking-data";

export function RestaurantSummaryCard() {
  return (
    <section aria-label="レストラン情報">
      <div className="flex items-center rounded-lg bg-[#f4f4f1] p-6 max-sm:items-start max-sm:p-4">
        <div
          aria-label="雅（みやび）ハノイ おまかせ"
          className="size-24 shrink-0 overflow-hidden rounded bg-[#1f2937] bg-cover bg-center max-sm:size-20"
          role="img"
          style={{ backgroundImage: `url(${restaurantImage})` }}
        />
        <div className="min-w-0 pl-6 max-sm:pl-4">
          <h2 className="font-jp text-2xl font-medium leading-8 text-[#1a1c1b] max-sm:text-lg max-sm:leading-7">
            雅（みやび）ハノイ おまかせ
          </h2>
          <div className="mt-1 flex items-center gap-1 text-[#5a6053]">
            <MapPin className="size-4 shrink-0" />
            <span className="font-jp text-base font-medium leading-6 max-sm:text-sm">
              ハノイ・ホアンキエム区
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="rounded-sm bg-[#c5eccc] px-2 py-0.5 font-jp text-xs font-medium uppercase leading-4 tracking-[0.6px] text-[#2c4e36]">
              認証済み
            </span>
            <span className="font-jp text-sm font-medium leading-5 text-[#af111c]">
              日本人スタッフ在籍
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
