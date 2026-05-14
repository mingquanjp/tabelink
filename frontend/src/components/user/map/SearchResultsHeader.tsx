"use client";

import { useState } from "react";
import { ArrowUpDown, X } from "lucide-react";

export type SortOption = "recommended" | "rating" | "distance";

export type AppliedFilter = {
  key: string;
  label: string;
};

type SearchResultsHeaderProps = {
  count: number;
  appliedFilters: AppliedFilter[];
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onRemoveFilter: (key: string) => void;
};

const sortLabels: Record<SortOption, string> = {
  recommended: "おすすめ順",
  rating: "評価が高い順",
  distance: "距離が近い順",
};

export function SearchResultsHeader({
  count,
  appliedFilters,
  sort,
  onSortChange,
  onRemoveFilter,
}: SearchResultsHeaderProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);

  return (
    <div className="border-b border-[rgba(228,190,186,0.1)] pb-[25px] pt-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-brand text-[20px] font-extrabold leading-7 text-[#1a1c1b]">
          検索結果 ({count}件)
        </h1>
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 font-jp text-[12px] font-medium leading-4 text-[#d32f2f]"
            onClick={() => setIsSortOpen((value) => !value)}
          >
            <ArrowUpDown className="size-3.5" />
            並び替え
          </button>
          {isSortOpen ? (
            <div className="absolute right-0 top-6 z-10 w-40 rounded-md border border-[#e2e3e0] bg-white p-1 shadow-[0_12px_24px_rgba(26,28,27,0.12)]">
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`w-full rounded px-3 py-2 text-left font-jp text-[12px] font-medium ${
                    sort === option
                      ? "bg-[#af111c0d] text-[#af111c]"
                      : "text-[#5a6053] hover:bg-[#f4f4f1]"
                  }`}
                  onClick={() => {
                    onSortChange(option);
                    setIsSortOpen(false);
                  }}
                >
                  {sortLabels[option]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {appliedFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-[#dfe5d4] px-3 py-1 font-jp text-[10px] font-medium leading-[15px] text-[#3d5f46]"
            onClick={() => onRemoveFilter(filter.key)}
          >
            {filter.label}
            <X className="size-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
