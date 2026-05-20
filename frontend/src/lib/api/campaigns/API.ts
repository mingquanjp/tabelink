import { apiRequest } from "@/lib/api/client";
import type {
  CreateOwnerAdRequest,
  CreateOwnerCampaignRequest,
  OwnerPromotion,
  OwnerPromotionsResponse,
  UpdateOwnerPromotionRequest,
  UploadOwnerAdImageResponse,
  UserCampaignsResponse,
} from "@/lib/api/campaigns/type";

export function getCampaigns() {
  return apiRequest<UserCampaignsResponse>("/campaigns");
}

export function getOwnerPromotions() {
  return apiRequest<OwnerPromotionsResponse>("/owner/promotions", {
    auth: true,
  });
}

export function createOwnerCampaign(body: CreateOwnerCampaignRequest) {
  return apiRequest<OwnerPromotion>("/owner/campaigns", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function createOwnerAdRequest(body: CreateOwnerAdRequest) {
  return apiRequest<OwnerPromotion>("/owner/ads/requests", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export function uploadOwnerAdImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadOwnerAdImageResponse>("/owner/ads/uploads", {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export function endOwnerPromotion(promotionId: number) {
  return apiRequest<OwnerPromotion>(`/owner/promotions/${promotionId}/end`, {
    method: "PATCH",
    auth: true,
  });
}

export function resumeOwnerPromotion(promotionId: number) {
  return apiRequest<OwnerPromotion>(`/owner/promotions/${promotionId}/resume`, {
    method: "PATCH",
    auth: true,
  });
}

export function updateOwnerPromotion(
  promotionId: number,
  body: UpdateOwnerPromotionRequest
) {
  return apiRequest<OwnerPromotion>(`/owner/promotions/${promotionId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  });
}
