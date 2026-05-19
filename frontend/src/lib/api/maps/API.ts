import { apiRequest } from "@/lib/api/client";
import type { RestaurantRouteResponse } from "@/lib/api/maps/type";
import {
  AdvancedSearchParams,
  AdvancedSearchResponse,
} from "./restaurant-advance-search/type";

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

export async function getRestaurantRoute(
  restaurantId: number,
  origin: { lat: number; lng: number },
  options: RequestInit = {},
) {
  const params = new URLSearchParams({
    originLat: String(origin.lat),
    originLng: String(origin.lng),
  });

  return apiRequest<RestaurantRouteResponse>(
    `/maps/restaurants/${restaurantId}/route?${params.toString()}`,
    { ...options, auth: true },
  );
}
