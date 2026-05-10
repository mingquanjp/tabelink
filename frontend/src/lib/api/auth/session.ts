import { ApiError } from "@/lib/api/client";
import { getMe, refreshSession } from "@/lib/api/auth/API";
import type { MeResponse } from "@/lib/api/auth/type";

export async function getAuthSession(): Promise<MeResponse | null> {
  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      try {
        await refreshSession();
        return await getMe();
      } catch {
        return null;
      }
    }

    return null;
  }
}

export function requireOwnerRestaurant(session: MeResponse | null) {
  const restaurant = session?.restaurant;

  if (!restaurant) {
    throw new Error("Owner restaurant not found.");
  }

  return restaurant;
}
