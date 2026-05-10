import { apiRequest } from "@/lib/api/client";
import type { HealthResponse } from "@/lib/api/type";

export function getHealth() {
  return apiRequest<HealthResponse>("/health");
}
