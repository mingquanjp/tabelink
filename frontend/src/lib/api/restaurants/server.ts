import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api/client";
import type { OwnerHomeResponse } from "@/lib/api/owner-home/type";
import type {
  PublicRestaurantDetailResponse,
  UserRestaurantDetailResponse,
} from "@/lib/api/restaurants/type";

function emptyMenu(): OwnerHomeResponse["menu"] {
  return {
    count: 0,
    activeCount: 0,
    recommendedForJpCount: 0,
    categories: [],
    items: [],
  };
}

function normalizeRestaurantDetail(
  data: PublicRestaurantDetailResponse,
): UserRestaurantDetailResponse {
  return {
    ...data,
    menu: data.menu ?? emptyMenu(),
  };
}

export async function getUserRestaurantDetail(restaurantId: number) {
  const cookieHeader = (await cookies()).toString();

  const data = await apiRequest<PublicRestaurantDetailResponse>(
    `/restaurants/${restaurantId}`,
    {
      auth: true,
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    },
  );

  return normalizeRestaurantDetail(data);
}
