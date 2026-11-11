import { describe, expect, it } from 'vitest';
import { TtlCache } from '@/core/services/TtlCache';

describe('TtlCache', () => {
  it('returns values before expiry and drops them afterwards', () => {
    const cache = new TtlCache<string, number>();
    cache.set('a', 1, 1000, 1000);
    expect(cache.get('a', 1500)).toBe(1);
    expect(cache.get('a', 2000)).toBeUndefined();
  });

  it('evicts the oldest entry when the bound is exceeded', () => {
    const cache = new TtlCache<string, number>(2);
    cache.set('a', 1, 60_000, 1000);
    cache.set('b', 2, 60_000, 1000);
    cache.set('c', 3, 60_000, 1000);
    expect(cache.size).toBe(2);
    expect(cache.get('a', 1000)).toBeUndefined();
    expect(cache.get('b', 1000)).toBe(2);
  });
});
