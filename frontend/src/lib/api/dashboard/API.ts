import { ApiError, apiRequest } from "@/lib/api/client";
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

export async function findOwnerDashboard(maxRestaurantId = 100) {
  let lastError: unknown = null;

  for (let restaurantId = 1; restaurantId <= maxRestaurantId; restaurantId += 1) {
    try {
      const dashboard = await getOwnerDashboard(restaurantId);
      return {
        restaurantId,
        dashboard,
      };
    } catch (error) {
      lastError = error;

      if (error instanceof ApiError && error.status === 401) {
        throw error;
      }
    }
  }

  if (lastError instanceof Error) {
    throw new Error(
      `No owned restaurant dashboard found from ID 1 to ${maxRestaurantId}. Last error: ${lastError.message}`
    );
  }

  throw new Error(`No owned restaurant dashboard found from ID 1 to ${maxRestaurantId}.`);
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
