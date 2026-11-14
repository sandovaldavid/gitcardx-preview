export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function evictIfNeeded(now: number): void {
  if (buckets.size <= MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

function extractRightmostIp(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const parts = headerValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

export function getClientIp(request: Request): string {
  return (
    extractRightmostIp(request.headers.get('x-vercel-forwarded-for')) ||
    request.headers.get('x-real-ip')?.trim() ||
    extractRightmostIp(request.headers.get('x-forwarded-for')) ||
    'unknown'
  );
}

/**
 * Per-instance fixed-window limiter. It reduces accidental bursts and scripted abuse in
 * development and single-instance self-hosting; production must also configure a distributed
 * Vercel Firewall/WAF rule (see docs/production-runbook.md).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);
  evictIfNeeded(now);

  const allowed = bucket.count <= limit;
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
  if (!result.allowed) headers['Retry-After'] = String(result.retryAfterSeconds);
  return headers;
}

export function resetRateLimitForTesting(): void {
  buckets.clear();
}
