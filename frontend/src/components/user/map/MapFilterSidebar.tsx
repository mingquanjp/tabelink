import { Check, Search, SquareMenu, Utensils, Warehouse } from "lucide-react";
import { cuisineTags, distanceOptions } from "./map-data";

const qualityItems = [
  { label: "衛生管理スコア 4.0以上", checked: true },
  { label: "日本人スタッフ常駐", checked: false },
  { label: "日本語メニュー完備", checked: false },
];

const amenities = [
  { label: "VAT発行可", icon: SquareMenu, checked: true },
  { label: "駐車場あり", icon: Warehouse, checked: true },
  { label: "個室完備", icon: Utensils, checked: true },
];

export function MapFilterSidebar() {
  return (
    <aside className="w-full shrink-0 border-r border-[rgba(228,190,186,0.15)] bg-[#f4f4f1] lg:h-[calc(100vh-80px)] lg:w-80 lg:overflow-y-auto">
      <div className="flex w-full flex-col gap-8 p-6">
        <section className="flex flex-col gap-4">
          <h2 className="font-jp text-[18px] font-medium leading-7 text-[#d32f2f]">
            検索フィルター
          </h2>
          <label className="relative block">
            <Search className="absolute left-[15px] top-1/2 size-[18px] -translate-y-1/2 text-[#5a6053]" />
            <input
              className="h-9 w-full rounded bg-white py-2 pl-10 pr-4 font-jp text-[14px] font-medium text-[#1a1c1b] outline-none placeholder:text-[#6b7280]"
              placeholder="キーワード、店名..."
            />
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5a6053]">
            現在地からの距離
          </h3>
          <div className="flex flex-col gap-2 px-2">
            <div className="h-1.5 rounded bg-[#e2e3e0]" />
            <div className="flex items-start justify-between font-manrope font-bold">
              <span className="text-[10px] leading-[15px] text-[#5b403d]">
                500m
              </span>
              <span className="text-[12px] leading-4 text-[#d32f2f]">
                1.0km
              </span>
              <span className="text-[10px] leading-[15px] text-[#5b403d]">
                5km
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {distanceOptions.map((option) => {
              const isActive = option === "1000m";

              return (
                <button
                  key={option}
                  type="button"
                  className={`rounded-md py-2 text-center font-manrope text-[10px] font-bold leading-[15px] ${
                    isActive
                      ? "bg-[#d32f2f] text-white"
                      : "bg-[#e2e3e0] text-[#606659]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#3d5f46]">
            日本クオリティ基準
          </h3>
          <div className="flex flex-col gap-3">
            {qualityItems.map((item) => (
              <label key={item.label} className="flex items-center">
                <span className="flex size-5 items-center justify-center rounded-[2px] border-2 border-[#e4beba]">
                  {item.checked ? (
                    <Check className="size-3.5 text-[#d32f2f]" strokeWidth={2.4} />
                  ) : null}
                </span>
                <span className="pl-3 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b]">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5a6053]">
            料理タイプ
          </h3>
          <div className="flex flex-wrap gap-2">
            {cuisineTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full bg-[#dfe5d4] px-3 py-1 font-jp text-[12px] font-medium leading-4 text-[#606659]"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5a6053]">
            設備・サービス
          </h3>
          <div className="flex flex-col gap-2">
            {amenities.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded p-2 ${
                    index === 0 ? "bg-[rgba(249,249,246,0.4)]" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="size-[18px] text-[#5a6053]" />
                    <span className="pl-2 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b]">
                      {item.label}
                    </span>
                  </div>
                  {item.checked ? (
                    <Check className="size-4 text-[#d32f2f]" strokeWidth={2.4} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
