import { apiRequest } from "@/lib/api/client";
import type {
  AdminUser,
  AdminUsersQuery,
  AdminUsersResponse,
  UpdateAdminUserPayload,
} from "@/lib/api/admin/type";

function toQueryString(query: AdminUsersQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function listAdminUsers(query: AdminUsersQuery = {}) {
  return apiRequest<AdminUsersResponse>(`/admin/users${toQueryString(query)}`, {
    auth: true,
  });
}

export function updateAdminUser(
  accountId: number,
  payload: UpdateAdminUserPayload
) {
  return apiRequest<AdminUser>(`/admin/users/${accountId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export function banAdminUser(accountId: number, reason: string) {
  return apiRequest<AdminUser>(`/admin/users/${accountId}/ban`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ reason }),
  });
}

export function restoreAdminUser(accountId: number, reason: string) {
  return apiRequest<AdminUser>(`/admin/users/${accountId}/restore`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ reason }),
  });
}
