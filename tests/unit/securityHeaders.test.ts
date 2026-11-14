import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

describe('Next.js security headers contract', () => {
  it('configures HSTS globally and scopes app CSP away from /api/* routes', async () => {
    const headerRules = await nextConfig.headers?.();
    expect(headerRules).toBeDefined();

    const globalRule = headerRules?.find((rule) => rule.source === '/:path*');
    expect(globalRule).toBeDefined();
    expect(globalRule?.headers).toContainEqual({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });

    const appCspRule = headerRules?.find((rule) => rule.source === '/((?!api/).*)');
    expect(appCspRule).toBeDefined();

    const cspHeader = appCspRule?.headers.find((h) => h.key === 'Content-Security-Policy');
    expect(cspHeader?.value).toContain("object-src 'none'");
    expect(cspHeader?.value).toContain("frame-ancestors 'none'");
    expect(cspHeader?.value).toContain("font-src 'self' https://cdn.jsdelivr.net data:");
    expect(cspHeader?.value).not.toContain("'unsafe-eval'");
  });
});
