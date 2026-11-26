// shortcut: in-memory rate limit di-reset saat cold start serverless; upgrade ke Redis/Upstash bila traffic tinggi.

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function createRateLimiter({
  windowMs,
  max,
  maxKeys = 500,
}: {
  windowMs: number;
  max: number;
  maxKeys?: number;
}) {
  const buckets = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now = Date.now()): RateLimitResult {
    if (buckets.size > maxKeys) {
      for (const [k, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(k);
      }
    }

    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterSec: 0 };
    }

    if (current.count >= max) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    }

    current.count += 1;
    return { allowed: true, retryAfterSec: 0 };
  };
}
