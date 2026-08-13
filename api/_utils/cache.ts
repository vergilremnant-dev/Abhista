interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const localCache = new Map<string, CacheEntry<unknown>>();

/**
 * Gets a cached item. Returns null if expired or missing.
 */
export function getCached<T>(key: string): T | null {
  const entry = localCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    localCache.delete(key);
    return null;
  }
  return entry.value as T;
}

/**
 * Sets a cached item with a TTL in milliseconds (default 5 minutes).
 */
export function setCached<T>(key: string, value: T, ttlMs: number = 300000): void {
  localCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Evicts a key or clears all cache entries.
 */
export function clearCache(key?: string): void {
  if (key) {
    localCache.delete(key);
  } else {
    localCache.clear();
  }
}
