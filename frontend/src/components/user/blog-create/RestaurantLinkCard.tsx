import { CheckCircle2, Loader2, Search, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { BlogRestaurantSearchItem } from "@/lib/api/blogs/type";

type RestaurantLinkCardProps = {
  value: string;
  isOpen: boolean;
  isSearching: boolean;
  options: BlogRestaurantSearchItem[];
  selectedRestaurantId?: number;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onSelect: (restaurant: BlogRestaurantSearchItem) => void;
};

function getRestaurantName(restaurant: BlogRestaurantSearchItem) {
  return restaurant.nameJp || restaurant.nameVn;
}

export function RestaurantLinkCard({
  value,
  isOpen,
  isSearching,
  options,
  selectedRestaurantId,
  onFocus,
  onBlur,
  onChange,
  onSelect,
}: RestaurantLinkCardProps) {
  const trimmedValue = value.trim();

  return (
    <Card className="relative overflow-visible rounded-lg border border-[#e4beba33] bg-white py-0 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
      <CardContent className="flex flex-col gap-4 p-6">
        <label
          htmlFor="restaurant-search"
          className="font-manrope text-base font-bold leading-6 tracking-[1px] text-[#5a6053]"
        >
          飲食店を紐付ける / LIÊN KẾT NHÀ HÀNG
        </label>
        <div className="flex w-full items-center gap-4 rounded bg-[#f4f4f1] p-4">
          <UtensilsCrossed className="size-5 text-[#af111c]" />
          <Input
            id="restaurant-search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="ハノイのレストランを検索"
            autoComplete="off"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="restaurant-search-results"
            className="h-auto border-0 bg-transparent p-0 font-manrope text-base font-medium text-[#1a1c1b] shadow-none placeholder:text-[#8f6f6c80] focus-visible:ring-0 md:text-base"
          />
          {isSearching ? (
            <Loader2 className="size-[18px] animate-spin text-[#8f6f6c]" />
          ) : (
            <Search className="size-[18px] text-[#8f6f6c]" />
          )}
        </div>

        {isOpen ? (
          <div
            id="restaurant-search-results"
            role="listbox"
            className="absolute left-6 right-6 top-[calc(100%-24px)] z-30 overflow-hidden rounded-b-lg border border-[#e4beba33] bg-white shadow-[0px_12px_24px_rgba(26,28,27,0.12)]"
          >
            {options.length > 0 ? (
              options.map((restaurant) => {
                const selected =
                  restaurant.restaurantId === selectedRestaurantId;

                return (
                  <button
                    key={restaurant.restaurantId}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(restaurant)}
                    className={`flex w-full items-start justify-between border-t border-[#e4beba1a] px-4 py-4 text-left transition-colors first:border-t-0 ${
                      selected
                        ? "border-l-4 border-l-[#af111c] bg-[#af111c0d] pl-5"
                        : "hover:bg-[#f9f9f6]"
                    }`}
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-manrope text-sm font-bold leading-5 text-[#1a1c1b] md:text-base md:leading-6">
                        {getRestaurantName(restaurant)}
                      </span>
                      <span className="font-manrope text-xs leading-4 text-[#5a6053]">
                        {restaurant.address}
                      </span>
                    </span>
                    {selected ? (
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#af111c]" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-5 font-jp text-sm text-[#5a6053]">
                {trimmedValue
                  ? "該当するレストランがありません"
                  : "レストラン名を入力してください"}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
