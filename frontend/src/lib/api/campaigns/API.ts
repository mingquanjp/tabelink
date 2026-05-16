import { apiRequest } from "@/lib/api/client";
import type { UserCampaignsResponse } from "@/lib/api/campaigns/type";

export function getCampaigns() {
  return apiRequest<UserCampaignsResponse>("/campaigns");
}
