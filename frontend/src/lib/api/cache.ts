type SessionCacheEntry<T> = {
  data: T;
  savedAt: number;
};

export const SESSION_CACHE_TTL = {
  auth: 60_000,
  ownerHome: 5 * 60_000,
  dashboard: 60_000,
  menu: 5 * 60_000,
  reservations: 30_000,
} as const;

export function readSessionCache<T>(key: string, maxAgeMs?: number): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const entry = JSON.parse(raw) as SessionCacheEntry<T>;

    if (
      maxAgeMs !== undefined &&
      Date.now() - entry.savedAt > maxAgeMs
    ) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function writeSessionCache<T>(key: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const entry: SessionCacheEntry<T> = {
      data,
      savedAt: Date.now(),
    };

    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Cache writes are best-effort; API data should still render.
  }
}

export function removeSessionCache(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function removeSessionCacheByPrefix(prefix: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);

      if (key?.startsWith(prefix)) {
        window.sessionStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage cleanup failures.
  }
}
