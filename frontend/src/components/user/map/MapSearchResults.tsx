import type { MapRestaurant } from "./map-data";
import { MapArea } from "./MapArea";
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
  isMapOpen: boolean;
  selectedRestaurant: MapRestaurant | null;
  onCloseMap: () => void;
  onOpenMap: (restaurant: MapRestaurant) => void;
  onSortChange: (sort: SortOption) => void;
  onRemoveFilter: (key: string) => void;
};

export function MapSearchResults({
  restaurants,
  appliedFilters,
  sort,
  isMapOpen,
  selectedRestaurant,
  onCloseMap,
  onOpenMap,
  onSortChange,
  onRemoveFilter,
}: MapSearchResultsProps) {
  if (isMapOpen && selectedRestaurant) {
    return (
      <main className="h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
        <div className="flex h-full min-h-0">
          <div className="flex h-full w-[360px] shrink-0 flex-col overflow-hidden border-r border-[rgba(228,190,186,0.15)] bg-white">
            <div className="shrink-0 px-6">
              <SearchResultsHeader
                appliedFilters={appliedFilters}
                count={restaurants.length}
                sort={sort}
                onRemoveFilter={onRemoveFilter}
                onSortChange={onSortChange}
              />
            </div>
            {restaurants.length > 0 ? (
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-8">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      isActive={restaurant.id === selectedRestaurant.id}
                      restaurant={restaurant}
                      variant="compact"
                      onMapOpen={onOpenMap}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="m-6 rounded-lg border border-dashed border-[#e4beba] bg-white px-6 py-12 text-center font-jp text-[14px] font-medium text-[#5a6053]">
                条件に一致するレストランはありません。
              </div>
            )}
          </div>
          <MapArea restaurant={selectedRestaurant} onClose={onCloseMap} />
        </div>
      </main>
    );
  }

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
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onMapOpen={onOpenMap}
              />
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
