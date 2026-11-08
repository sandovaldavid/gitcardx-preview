import { describe, it, expect } from 'vitest';
import { APP_VERSION, APP_VERSION_TAG } from '@/lib/version';

describe('Application Version', () => {
  it('exposes a valid semver version string', () => {
    expect(APP_VERSION).toBeDefined();
    expect(typeof APP_VERSION).toBe('string');
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
  });

  it('formats APP_VERSION_TAG with a leading v', () => {
    expect(APP_VERSION_TAG).toBe(`v${APP_VERSION}`);
    expect(APP_VERSION_TAG.startsWith('v')).toBe(true);
  });
});
