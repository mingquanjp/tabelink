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

function hasSessionCookie() {
  if (typeof document === "undefined") {
    return true;
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith("hasSession="));
}

export function clearAuthSessionCache() {
  removeSessionCache(authSessionCacheKey);
}

export function writeCachedAuthSession(session: MeResponse) {
  writeSessionCache(authSessionCacheKey, session);
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

  if (!hasSessionCookie()) {
    clearAuthSessionCache();
    return null;
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
