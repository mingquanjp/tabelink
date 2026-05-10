import { apiRequest } from "@/lib/api/client";
import type {
  OwnerMenuItem,
  OwnerMenuListResponse,
  OwnerMenuPayload,
  UploadOwnerMenuImageResponse,
} from "@/lib/api/menu/type";

export function listOwnerMenuItems(restaurantId: number) {
  return apiRequest<OwnerMenuListResponse>(
    `/owner/restaurants/${restaurantId}/menus`,
    { auth: true }
  );
}

export function createOwnerMenuItem(
  restaurantId: number,
  payload: OwnerMenuPayload
) {
  return apiRequest<OwnerMenuItem>(`/owner/restaurants/${restaurantId}/menus`, {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export function updateOwnerMenuItem(
  restaurantId: number,
  itemId: number,
  payload: OwnerMenuPayload
) {
  return apiRequest<OwnerMenuItem>(
    `/owner/restaurants/${restaurantId}/menus/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      auth: true,
    }
  );
}

export function uploadOwnerMenuImage(restaurantId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadOwnerMenuImageResponse>(
    `/owner/restaurants/${restaurantId}/menus/images`,
    {
      method: "POST",
      body: formData,
      auth: true,
    }
  );
}
