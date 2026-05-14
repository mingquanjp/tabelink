import { ApiError } from "@/lib/api/client";
import { getMe, refreshSession } from "@/lib/api/auth/API";
import type { MeResponse } from "@/lib/api/auth/type";
import {
  readSessionCache,
  removeSessionCache,
  SESSION_CACHE_TTL,
  writeSessionCache,
} from "@/lib/api/cache";

const authSessionCacheKey = "tabelink:auth-session:v1";

export function clearAuthSessionCache() {
  removeSessionCache(authSessionCacheKey);
}

export function readCachedAuthSession() {
  return readSessionCache<MeResponse>(
    authSessionCacheKey,
    SESSION_CACHE_TTL.auth,
  );
}

export async function getAuthSession(): Promise<MeResponse | null> {
  const cachedSession = readCachedAuthSession();

  if (cachedSession) {
    return cachedSession;
  }

  try {
    const session = await getMe();
    writeSessionCache(authSessionCacheKey, session);
    return session;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      try {
        await refreshSession();
        const session = await getMe();
        writeSessionCache(authSessionCacheKey, session);
        return session;
      } catch {
        clearAuthSessionCache();
        return null;
      }
    }

    clearAuthSessionCache();
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
