import { ArrowUpDown } from "lucide-react";

type SearchResultsHeaderProps = {
  count: number;
};

export function SearchResultsHeader({ count }: SearchResultsHeaderProps) {
  return (
    <div className="border-b border-[rgba(228,190,186,0.1)] pb-[25px] pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-brand text-[20px] font-extrabold leading-7 text-[#1a1c1b]">
          検索結果 ({count}件)
        </h1>
        <button
          type="button"
          className="flex items-center gap-1 font-jp text-[12px] font-medium leading-4 text-[#d32f2f]"
        >
          <ArrowUpDown className="size-3.5" />
          並び替え
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#dfe5d4] px-3 py-1 font-jp text-[10px] font-medium leading-[15px] text-[#3d5f46]">
          日本基準認証店のみ
        </span>
        <span className="rounded-full bg-[#dfe5d4] px-3 py-1 font-manrope text-[10px] font-medium leading-[15px] text-[#5a6053]">
          1.0km以内
        </span>
      </div>
    </div>
  );
}
