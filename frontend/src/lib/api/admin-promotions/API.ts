import { apiRequest } from "@/lib/api/client";
import type {
  AdminPromotion,
  AdminPromotionsQuery,
  AdminPromotionsResponse,
  AdminPromotionSummary,
} from "@/lib/api/admin-promotions/type";

function toSearchParams(query: AdminPromotionsQuery = {}) {
  const searchParams = new URLSearchParams();

  if (query.search) {
    searchParams.set("search", query.search);
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.page !== undefined) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    searchParams.set("limit", String(query.limit));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getAdminPromotionSummary() {
  return apiRequest<AdminPromotionSummary>("/admin/promotions/summary", {
    auth: true,
  });
}

export function getAdminPromotions(query: AdminPromotionsQuery = {}) {
  return apiRequest<AdminPromotionsResponse>(
    `/admin/promotions${toSearchParams(query)}`,
    {
      auth: true,
    },
  );
}

export function getAdminPromotion(promotionId: number) {
  return apiRequest<AdminPromotion>(`/admin/promotions/${promotionId}`, {
    auth: true,
  });
}

export function approveAdminPromotion(promotionId: number) {
  return apiRequest<AdminPromotion>(
    `/admin/promotions/${promotionId}/approve`,
    {
      method: "PATCH",
      auth: true,
    },
  );
}

export function rejectAdminPromotion(promotionId: number, reason: string) {
  return apiRequest<AdminPromotion>(`/admin/promotions/${promotionId}/reject`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ reason }),
  });
}
