type Entry<T> = { value: T; expiresAt: number };

// In-process TTL cache for read-heavy public endpoints, sitting in front of MongoDB.
// Single-instance only (no shared store) — fine at the current one-process scale;
// would need Redis if the API ever runs as more than one instance.
export function createTtlCache<T>(ttlMs: number) {
  const store = new Map<string, Entry<T>>();

  return {
    async getOrSet(key: string, load: () => Promise<T>): Promise<T> {
      const hit = store.get(key);
      if (hit && hit.expiresAt > Date.now()) return hit.value;
      const value = await load();
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    },
    clear(): void {
      store.clear();
    },
  };
}
