import { apiRequest } from "@/lib/api/client";
import type {
  OwnerHomeResponse,
  UpdateOwnerRestaurantPayload,
  UploadOwnerRestaurantImageResponse,
} from "@/lib/api/owner-home/type";

export function getOwnerHome() {
  return apiRequest<OwnerHomeResponse>("/owner/restaurant/home", {
    auth: true,
  });
}

export function updateOwnerRestaurant(payload: UpdateOwnerRestaurantPayload) {
  return apiRequest<OwnerHomeResponse["restaurant"]>("/owner/restaurant", {
    auth: true,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadOwnerRestaurantImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadOwnerRestaurantImageResponse>(
    "/owner/restaurant/images",
    {
      auth: true,
      method: "POST",
      body: formData,
    },
  );
}
