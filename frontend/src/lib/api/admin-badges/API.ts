import { apiRequest } from "@/lib/api/client";
import type {
  AdminBadgeActionPayload,
  AdminBadgeApplication,
  AdminBadgeApplicationsQuery,
  AdminBadgeApplicationsResponse,
} from "@/lib/api/admin-badges/type";

function toSearchParams(query: AdminBadgeApplicationsQuery = {}) {
  const params = new URLSearchParams();

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function listAdminBadgeApplications(
  query: AdminBadgeApplicationsQuery = {},
) {
  return apiRequest<AdminBadgeApplicationsResponse>(
    `/admin/verification/applications${toSearchParams(query)}`,
    { auth: true },
  );
}

export function getAdminBadgeApplication(appId: number) {
  return apiRequest<AdminBadgeApplication>(
    `/admin/verification/applications/${appId}`,
    { auth: true },
  );
}

export function approveAdminBadgeApplication(
  appId: number,
  payload: AdminBadgeActionPayload = {},
) {
  return apiRequest<AdminBadgeApplication>(
    `/admin/verification/applications/${appId}/approve`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(payload),
    },
  );
}

export function rejectAdminBadgeApplication(
  appId: number,
  payload: AdminBadgeActionPayload,
) {
  return apiRequest<AdminBadgeApplication>(
    `/admin/verification/applications/${appId}/reject`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(payload),
    },
  );
}

export function requestAdminBadgeInformation(
  appId: number,
  payload: AdminBadgeActionPayload,
) {
  return apiRequest<AdminBadgeApplication>(
    `/admin/verification/applications/${appId}/request-info`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(payload),
    },
  );
}

export function revokeAdminBadge(appId: number, payload: AdminBadgeActionPayload) {
  return apiRequest<AdminBadgeApplication>(
    `/admin/verification/applications/${appId}/revoke`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(payload),
    },
  );
}
