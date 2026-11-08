import { describe, it, expect } from 'vitest';
import { sanitizeImageUrl } from '@/core/security/ssrf';

describe('sanitizeImageUrl (Anti-SSRF defense)', () => {
  const fallback = 'https://avatars.githubusercontent.com/u/0';

  it('allows trusted GitHub avatar URLs', () => {
    const trusted = 'https://avatars.githubusercontent.com/u/12345?v=4';
    expect(sanitizeImageUrl(trusted, fallback)).toBe(trusted);
  });

  it('allows trusted raw.githubusercontent.com URLs', () => {
    const trusted = 'https://raw.githubusercontent.com/user/repo/main/logo.png';
    expect(sanitizeImageUrl(trusted, fallback)).toBe(trusted);
  });

  it('allows safe inline base64 image data URIs', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    expect(sanitizeImageUrl(dataUri, fallback)).toBe(dataUri);
  });

  it('rejects external untrusted hostnames and returns fallback', () => {
    const untrusted = 'https://evil-attacker.com/malicious.png';
    expect(sanitizeImageUrl(untrusted, fallback)).toBe(fallback);
  });

  it('rejects localhost and private IP addresses', () => {
    expect(sanitizeImageUrl('http://localhost:3000/image.png', fallback)).toBe(fallback);
    expect(sanitizeImageUrl('http://127.0.0.1:8080/image.png', fallback)).toBe(fallback);
    expect(sanitizeImageUrl('http://169.254.169.254/latest/meta-data', fallback)).toBe(fallback);
    expect(sanitizeImageUrl('http://10.0.0.1/logo.png', fallback)).toBe(fallback);
    expect(sanitizeImageUrl('http://192.168.1.1/logo.png', fallback)).toBe(fallback);
  });

  it('rejects non-HTTPS URLs', () => {
    const httpUrl = 'http://avatars.githubusercontent.com/u/12345';
    expect(sanitizeImageUrl(httpUrl, fallback)).toBe(fallback);
  });

  it('handles null, undefined and malformed URLs gracefully', () => {
    expect(sanitizeImageUrl(null, fallback)).toBe(fallback);
    expect(sanitizeImageUrl(undefined, fallback)).toBe(fallback);
    expect(sanitizeImageUrl('not a valid url', fallback)).toBe(fallback);
  });
});
