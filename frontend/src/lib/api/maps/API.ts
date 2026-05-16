import { apiRequest } from "@/lib/api/client";
import type { RestaurantRouteResponse } from "@/lib/api/maps/type";
import {
  AdvancedSearchParams,
  AdvancedSearchResponse,
} from "./restaurant-advance-search/type";

// function mergeMockFilterMetadata(
//   restaurant: Partial<MapRestaurant>,
//   index: number
// ) {
//   const mock = mockRestaurants[index % mockRestaurants.length];

//   return {
//     ...mock,
//     ...restaurant,
//     id: Number(restaurant.id),
//     name: restaurant.name ?? mock.name,
//     mapName: restaurant.mapName ?? mock.mapName,
//     address: restaurant.address ?? mock.address,
//     position: restaurant.position ?? mock.position,
//     distance: restaurant.distance ?? "---",
//     distanceValue: restaurant.distanceValue ?? "5km",
//     rating: restaurant.rating ?? mock.rating,
//     ratingValue: restaurant.ratingValue ?? mock.ratingValue,
//     imageUrl: restaurant.imageUrl || mock.imageUrl,
//     isVerified: mock.isVerified ?? restaurant.isVerified ?? true,
//     hasJapaneseStaff:
//       mock.hasJapaneseStaff ?? restaurant.hasJapaneseStaff ?? false,
//     hasJapaneseMenu: mock.hasJapaneseMenu ?? restaurant.hasJapaneseMenu ?? false,
//     cuisine: mock.cuisine,
//     amenities: mock.amenities,
//     badges: mock.badges,
//     features: mock.features,
//   } satisfies MapRestaurant;
// }

export async function advancedSearchRestaurants(params: AdvancedSearchParams) {
  const urlParams = new URLSearchParams();

  if (params.keyword) urlParams.append("keyword", params.keyword);
  if (params.lat) urlParams.append("lat", String(params.lat));
  if (params.lng) urlParams.append("lng", String(params.lng));
  if (params.radius) urlParams.append("radius", String(params.radius));
  if (params.issuesVAT !== undefined)
    urlParams.append("issuesVAT", String(params.issuesVAT));
  if (params.page) urlParams.append("page", String(params.page));
  if (params.limit) urlParams.append("limit", String(params.limit));

  params.dishTypes?.forEach((id) => urlParams.append("dishTypes", String(id)));
  params.services?.forEach((id) => urlParams.append("services", String(id)));
  params.japaneseStandards?.forEach((id) =>
    urlParams.append("japaneseStandards", String(id)),
  );

  // Gọi API (auth: false để Guest cũng dùng được)
  return apiRequest<AdvancedSearchResponse>(
    `/maps/advanced-search?${urlParams.toString()}`,
    { auth: false },
  );
}
// export async function getMapRestaurants() {
//   const data = await apiRequest<Partial<MapRestaurant>[]>(
//     "/maps/restaurants",
//     { auth: true }
//   );
//   return data.map((restaurant, index) =>
//     mergeMockFilterMetadata(restaurant, index)
//   );
// }

export async function getRestaurantRoute(
  restaurantId: number,
  origin: { lat: number; lng: number },
) {
  const params = new URLSearchParams({
    originLat: String(origin.lat),
    originLng: String(origin.lng),
  });

  return apiRequest<RestaurantRouteResponse>(
    `/maps/restaurants/${restaurantId}/route?${params.toString()}`,
    { auth: true },
  );
}
