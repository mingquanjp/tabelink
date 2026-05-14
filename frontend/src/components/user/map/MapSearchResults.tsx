import { restaurants } from "./map-data";
import { RestaurantCard } from "./RestaurantCard";
import { SearchResultsHeader } from "./SearchResultsHeader";

export function MapSearchResults() {
  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f1]">
      <div className="mx-auto flex w-full max-w-[960px] flex-col px-6 py-10 lg:px-10">
        <SearchResultsHeader count={42} />
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </main>
  );
}
