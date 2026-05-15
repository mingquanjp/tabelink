import { apiRequest } from "@/lib/api/client";
import type {
  CreateRestaurantReviewPayload,
  CreateRestaurantReviewResponse,
} from "@/lib/api/restaurants/type";

export function createRestaurantReview(
  restaurantId: number,
  payload: CreateRestaurantReviewPayload,
) {
  return apiRequest<CreateRestaurantReviewResponse>(
    `/restaurants/${restaurantId}/reviews`,
    {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

