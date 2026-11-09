import { describe, it, expect } from 'vitest';
import { isAllowedEmojiUrl, isAllowedFontUrl, sanitizeImageUrl } from '@/core/security/ssrf';

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

  it('allows safe inline base64 image data URIs (PNG, JPEG, WebP, SVG)', () => {
    const pngUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const jpegUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD';
    const webpUri = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQ';
    const svgUri =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
    expect(sanitizeImageUrl(pngUri, fallback)).toBe(pngUri);
    expect(sanitizeImageUrl(jpegUri, fallback)).toBe(jpegUri);
    expect(sanitizeImageUrl(webpUri, fallback)).toBe(webpUri);
    expect(sanitizeImageUrl(svgUri, fallback)).toBe(svgUri);
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

describe('isAllowedFontUrl (Fontsource API & CDN SSRF allowlist)', () => {
  it('allows valid HTTPS Fontsource catalog and CDN font binary URLs', () => {
    expect(isAllowedFontUrl('https://api.fontsource.org/v1/fonts')).toBe(true);
    expect(isAllowedFontUrl('https://api.fontsource.org/v1/fonts/space-grotesk')).toBe(true);
    expect(
      isAllowedFontUrl(
        'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.ttf'
      )
    ).toBe(true);
    expect(
      isAllowedFontUrl(
        'https://cdn.jsdelivr.net/fontsource/fonts/fira-code@5.1.0/latin-400-normal.woff'
      )
    ).toBe(true);
  });

  it('rejects non-HTTPS, localhost/private hosts, path traversal, and non-Fontsource jsDelivr paths', () => {
    expect(isAllowedFontUrl('http://api.fontsource.org/v1/fonts')).toBe(false);
    expect(isAllowedFontUrl('https://127.0.0.1/v1/fonts')).toBe(false);
    expect(isAllowedFontUrl('https://localhost/v1/fonts')).toBe(false);
    expect(isAllowedFontUrl('https://cdn.jsdelivr.net/npm/evil-pkg@1.0.0/index.js')).toBe(false);
    expect(
      isAllowedFontUrl('https://cdn.jsdelivr.net/fontsource/fonts/../secret/latin-400-normal.ttf')
    ).toBe(false);
    expect(isAllowedFontUrl('https://user:pass@api.fontsource.org/v1/fonts')).toBe(false);
    expect(isAllowedFontUrl('https://api.fontsource.org:8443/v1/fonts')).toBe(false);
  });
});

describe('isAllowedEmojiUrl (Twemoji CDN SSRF allowlist)', () => {
  it('allows canonical HTTPS Twemoji hex codepoint SVG URLs', () => {
    expect(
      isAllowedEmojiUrl('https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f680.svg')
    ).toBe(true);
    expect(
      isAllowedEmojiUrl(
        'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/2764-fe0f-200d-1f525.svg'
      )
    ).toBe(true);
  });

  it('rejects non-HTTPS, custom ports, query strings, path traversal, and non-hex filenames', () => {
    expect(
      isAllowedEmojiUrl('http://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f680.svg')
    ).toBe(false);
    expect(
      isAllowedEmojiUrl(
        'https://cdn.jsdelivr.net:8443/gh/jdecked/twemoji@15.1.0/assets/svg/1f680.svg'
      )
    ).toBe(false);
    expect(
      isAllowedEmojiUrl(
        'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f680.svg?token=1'
      )
    ).toBe(false);
    expect(
      isAllowedEmojiUrl(
        'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/../secret.svg'
      )
    ).toBe(false);
    expect(
      isAllowedEmojiUrl('https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/UPPER.svg')
    ).toBe(false);
    expect(isAllowedEmojiUrl('https://evil.example.com/1f680.svg')).toBe(false);
  });
});
