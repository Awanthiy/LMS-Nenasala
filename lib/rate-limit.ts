/**
 * Simple in-memory sliding-window limiter.
 * NOTE: per-process only. Replace the store with Redis/Upstash before running
 * more than one server instance in production.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterMs = windowMs - (now - (hits[0] ?? now));
    return { allowed: false as const, retryAfterMs };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true as const, retryAfterMs: 0 };
}

export function resetRateLimit(key?: string) {
  if (key) buckets.delete(key);
  else buckets.clear();
}
