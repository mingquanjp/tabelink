import { ApiError, apiRequest } from "@/lib/api/client";
import {
  getAuthSession,
  requireOwnerRestaurant,
} from "@/lib/api/auth/session";
import type {
  AdCounterResponse,
  MenuItemViewResponse,
  OwnerDashboardResponse,
  RestaurantViewResponse,
  TopMenuResponse,
} from "@/lib/api/dashboard/type";

export function getOwnerDashboard(restaurantId: number) {
  return apiRequest<OwnerDashboardResponse>(
    `/owner/restaurants/${restaurantId}/dashboard`,
    { auth: true }
  );
}

export async function findOwnerDashboard() {
  const session = await getAuthSession();

  if (!session) {
    throw new ApiError("Authentication is required.", 401);
  }

  const restaurant = requireOwnerRestaurant(session);
  const dashboard = await getOwnerDashboard(restaurant.restaurantId);

  return {
    restaurantId: restaurant.restaurantId,
    dashboard,
  };
}

export function getTopMenu(restaurantId: number) {
  return apiRequest<TopMenuResponse>(
    `/owner/restaurants/${restaurantId}/analytics/top-menu`,
    { auth: true }
  );
}

export function recordRestaurantView(
  restaurantId: number,
  isJapaneseVisitor = false
) {
  return apiRequest<RestaurantViewResponse>(
    `/restaurants/${restaurantId}/views`,
    {
      method: "POST",
      body: JSON.stringify({ isJapaneseVisitor }),
    }
  );
}

export function recordMenuItemView(itemId: number) {
  return apiRequest<MenuItemViewResponse>(`/menu-items/${itemId}/views`, {
    method: "POST",
  });
}

export function recordAdImpression(adId: number) {
  return apiRequest<AdCounterResponse>(`/ads/${adId}/impressions`, {
    method: "POST",
  });
}

export function recordAdClick(adId: number) {
  return apiRequest<AdCounterResponse>(`/ads/${adId}/clicks`, {
    method: "POST",
  });
}
