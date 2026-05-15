import { apiRequest } from "@/lib/api/client";
import type { RestaurantRouteResponse } from "@/lib/api/maps/type";
import {
  restaurants as mockRestaurants,
  type MapRestaurant,
} from "@/components/user/map/map-data";

function mergeMockFilterMetadata(
  restaurant: Partial<MapRestaurant>,
  index: number
) {
  const mock = mockRestaurants[index % mockRestaurants.length];

  return {
    ...mock,
    ...restaurant,
    id: Number(restaurant.id),
    name: restaurant.name ?? mock.name,
    mapName: restaurant.mapName ?? mock.mapName,
    address: restaurant.address ?? mock.address,
    position: restaurant.position ?? mock.position,
    distance: restaurant.distance ?? "---",
    distanceValue: restaurant.distanceValue ?? "5km",
    rating: restaurant.rating ?? mock.rating,
    ratingValue: restaurant.ratingValue ?? mock.ratingValue,
    imageUrl: restaurant.imageUrl || mock.imageUrl,
    isVerified: mock.isVerified ?? restaurant.isVerified ?? true,
    hasJapaneseStaff:
      mock.hasJapaneseStaff ?? restaurant.hasJapaneseStaff ?? false,
    hasJapaneseMenu: mock.hasJapaneseMenu ?? restaurant.hasJapaneseMenu ?? false,
    cuisine: mock.cuisine,
    amenities: mock.amenities,
    badges: mock.badges,
    features: mock.features,
  } satisfies MapRestaurant;
}

export async function getMapRestaurants() {
  const data = await apiRequest<Partial<MapRestaurant>[]>(
    "/maps/restaurants",
    { auth: true }
  );
  return data.map((restaurant, index) =>
    mergeMockFilterMetadata(restaurant, index)
  );
}

export async function getRestaurantRoute(
  restaurantId: number,
  origin: { lat: number; lng: number }
) {
  const params = new URLSearchParams({
    originLat: String(origin.lat),
    originLng: String(origin.lng),
  });

  return apiRequest<RestaurantRouteResponse>(
    `/maps/restaurants/${restaurantId}/route?${params.toString()}`,
    { auth: true }
  );
}
