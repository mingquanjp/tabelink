import { apiRequest } from "@/lib/api/client";
import type {
  CreateRestaurantReservationPayload,
  CreateRestaurantReservationResponse,
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

export function createRestaurantReservation(
  restaurantId: number,
  payload: CreateRestaurantReservationPayload,
) {
  return apiRequest<CreateRestaurantReservationResponse>(
    `/restaurants/${restaurantId}/reservations`,
    {
      auth: true,
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
