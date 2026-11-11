import { describe, expect, it, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
  resetRateLimitForTesting,
} from '@/lib/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => resetRateLimitForTesting());

  it('allows requests up to the limit and blocks the next one', () => {
    expect(checkRateLimit('ip:route', 2, 1000, 1000).allowed).toBe(true);
    expect(checkRateLimit('ip:route', 2, 1000, 1000).allowed).toBe(true);

    const blocked = checkRateLimit('ip:route', 2, 1000, 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBe(1);
    expect(rateLimitHeaders(blocked)['Retry-After']).toBe('1');
  });

  it('resets after the window elapses and keeps keys independent', () => {
    expect(checkRateLimit('a', 1, 1000, 1000).allowed).toBe(true);
    expect(checkRateLimit('a', 1, 1000, 1500).allowed).toBe(false);
    expect(checkRateLimit('a', 1, 1000, 2001).allowed).toBe(true);
    expect(checkRateLimit('b', 1, 1000, 2001).allowed).toBe(true);
  });

  it('extracts the first forwarded client address', () => {
    const request = new Request('https://gitframe.dev', {
      headers: { 'x-forwarded-for': '203.0.113.4, 10.0.0.1' },
    });
    expect(getClientIp(request)).toBe('203.0.113.4');
  });
});
