import type { MapRestaurant } from "./map-data";
import { RestaurantCard } from "./RestaurantCard";
import {
  SearchResultsHeader,
  type AppliedFilter,
  type SortOption,
} from "./SearchResultsHeader";

type MapSearchResultsProps = {
  restaurants: MapRestaurant[];
  appliedFilters: AppliedFilter[];
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onRemoveFilter: (key: string) => void;
};

export function MapSearchResults({
  restaurants,
  appliedFilters,
  sort,
  onSortChange,
  onRemoveFilter,
}: MapSearchResultsProps) {
  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f1]">
      <div className="flex w-full flex-col">
        <SearchResultsHeader
          appliedFilters={appliedFilters}
          count={restaurants.length}
          sort={sort}
          onRemoveFilter={onRemoveFilter}
          onSortChange={onSortChange}
        />
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-10 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-[#e4beba] bg-white px-6 py-12 text-center font-jp text-[14px] font-medium text-[#5a6053]">
            条件に一致するレストランはありません。
          </div>
        )}
      </div>
    </main>
  );
}
