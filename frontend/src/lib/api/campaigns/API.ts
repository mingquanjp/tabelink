import { apiRequest } from "@/lib/api/client";
import type {
  CreateOwnerAdRequest,
  CreateOwnerCampaignRequest,
  OwnerPromotion,
  OwnerPromotionsResponse,
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
