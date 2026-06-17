"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Search, SquareMenu, Utensils, Warehouse } from "lucide-react";
import {
  cuisineTags,
  type AmenityKey,
} from "./map-data";
import { formatDistanceShort } from "./map-routing";

export type QualityFilterKey = "hygiene" | "japaneseStaff" | "japaneseMenu";

export type MapFilterState = {
  keyword: string;
  distance: number;
  quality: Record<QualityFilterKey, boolean>;
  cuisines: string[];
  amenities: Record<AmenityKey, boolean>;
};

type MapFilterSidebarProps = {
  filters: MapFilterState;
  onKeywordChange: (value: string) => void;
  onKeywordBlur: () => void;
  onDistanceChange: (value: number) => void;
  onQualityToggle: (key: QualityFilterKey) => void;
  onCuisineToggle: (value: string) => void;
  onAmenityToggle: (key: AmenityKey) => void;
};

const qualityItems: Array<{ key: QualityFilterKey; label: string }> = [
  { key: "hygiene", label: "評価 4.0以上" },
  { key: "japaneseStaff", label: "日本人スタッフ常駐" },
  { key: "japaneseMenu", label: "日本語メニュー完備" },
];

const amenities: Array<{
  key: AmenityKey;
  label: string;
  icon: typeof SquareMenu;
}> = [
  { key: "vat", label: "VAT発行可", icon: SquareMenu },
  { key: "parking", label: "駐車場あり", icon: Warehouse },
  { key: "privateRoom", label: "個室完備", icon: Utensils },
];

export function MapFilterSidebar({
  filters,
  onKeywordChange,
  onKeywordBlur,
  onDistanceChange,
  onQualityToggle,
  onCuisineToggle,
  onAmenityToggle,
}: MapFilterSidebarProps) {
  const [localDistance, setLocalDistance] = useState(filters.distance);
  const isLocalChangeRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync từ parent khi reset filter từ bên ngoài (chip ×)
  useEffect(() => {
    if (!isLocalChangeRef.current) {
      setLocalDistance(filters.distance);
    }
    isLocalChangeRef.current = false;
  }, [filters.distance]);

  function handleDistanceChange(value: number) {
    isLocalChangeRef.current = true;
    setLocalDistance(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onDistanceChange(value), 300);
  }

  const fillPercent = ((localDistance - 500) / 9500) * 100;

  return (
    <aside className="w-full shrink-0 border border-[rgba(228,190,186,0.15)] bg-[#f4f4f1] lg:sticky lg:top-24 lg:max-h-[calc(100vh-112px)] lg:w-80 lg:overflow-y-auto">
      <div className="flex w-full flex-col gap-8 p-5">
        <section className="flex flex-col gap-4">
          <h2 className="font-jp text-[18px] font-medium leading-7 text-[#d32f2f]">
            検索フィルター
          </h2>
          <label className="relative block">
            <Search className="absolute left-[15px] top-1/2 size-[18px] -translate-y-1/2 text-[#5a6053]" />
            <input
              className="h-9 w-full rounded bg-white py-2 pl-10 pr-4 font-jp text-[14px] font-medium text-[#1a1c1b] outline-none placeholder:text-[#6b7280]"
              maxLength={255}
              placeholder="キーワード、店名..."
              value={filters.keyword}
              onBlur={onKeywordBlur}
              onChange={(event) => onKeywordChange(event.target.value)}
            />
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5a6053]">
              現在地からの距離
            </h3>
            <span className="font-manrope text-[12px] font-bold text-[#d32f2f]">
              {formatDistanceShort(localDistance)}以内
            </span>
          </div>
          <div className="flex flex-col gap-2 px-2">
            <div className="relative flex h-6 items-center">
              <div className="absolute left-0 h-1.5 w-full rounded bg-[#e2e3e0]" />
              <div
                className="absolute left-0 h-1.5 rounded bg-[#d32f2f]"
                style={{ width: `${fillPercent}%` }}
              />
              <div
                className="pointer-events-none absolute size-4 rounded-full border-2 border-white bg-[#d32f2f] shadow-md"
                style={{ left: `calc(${fillPercent}% - ${fillPercent * 0.16}px)` }}
              />
              <input
                type="range"
                min={500}
                max={10000}
                step={100}
                value={localDistance}
                onChange={(e) => handleDistanceChange(Number(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <div className="flex items-center justify-between font-manrope text-[10px] font-bold text-[#5b403d]">
              <span>500m</span>
              <span>10km</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#3d5f46]">
            日本クオリティ基準
          </h3>
          <div className="flex flex-col gap-3">
            {qualityItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className="flex items-center text-left"
                onClick={() => onQualityToggle(item.key)}
              >
                <span className="flex size-5 items-center justify-center rounded-[2px] border-2 border-[#e4beba]">
                  {filters.quality[item.key] ? (
                    <Check className="size-3.5 text-[#d32f2f]" strokeWidth={2.4} />
                  ) : null}
                </span>
                <span className="pl-3 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-jp text-[14px] font-medium uppercase leading-5 tracking-[0.7px] text-[#5a6053]">
            料理タイプ
          </h3>
          <div className="flex flex-wrap gap-2">
            {cuisineTags.map((tag) => {
              const isActive = filters.cuisines.includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  className={`rounded-full px-3 py-1 font-jp text-[12px] font-medium leading-4 ${
                    isActive
                      ? "bg-[#d32f2f] text-white"
                      : "bg-[#dfe5d4] text-[#606659]"
                  }`}
                  onClick={() => onCuisineToggle(tag)}
                >
                  {tag}
                </button>
              );
            })}
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
                <button
                  key={item.key}
                  type="button"
                  className={`flex items-center justify-between rounded p-2 text-left ${
                    index === 0 ? "bg-[rgba(249,249,246,0.4)]" : ""
                  }`}
                  onClick={() => onAmenityToggle(item.key)}
                >
                  <div className="flex items-center">
                    <Icon className="size-[18px] text-[#5a6053]" />
                    <span className="pl-2 font-jp text-[14px] font-medium leading-5 text-[#1a1c1b]">
                      {item.label}
                    </span>
                  </div>
                  {filters.amenities[item.key] ? (
                    <Check className="size-4 text-[#d32f2f]" strokeWidth={2.4} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
