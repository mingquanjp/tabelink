import { apiRequest } from "@/lib/api/client";
import type { UserNotificationsResponse } from "@/lib/api/notifications/type";

export function getUserNotifications() {
  return apiRequest<UserNotificationsResponse>("/user/notifications", {
    auth: true,
  });
}
