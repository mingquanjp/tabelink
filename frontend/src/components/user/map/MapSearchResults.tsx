import { restaurants } from "./map-data";
import { RestaurantCard } from "./RestaurantCard";
import { SearchResultsHeader } from "./SearchResultsHeader";

export function MapSearchResults() {
  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f1]">
      <div className="flex w-full flex-col">
        <SearchResultsHeader count={42} />
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-10 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </main>
  );
}
