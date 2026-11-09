import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/card/render/route';
import { DEFAULT_REPO, DEFAULT_CONFIG } from '@/studio/state/useCardStore';

describe('On-Demand Card Render Route (/api/card/render)', () => {
  it('renders a valid PNG buffer directly from client studio payload', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: DEFAULT_REPO,
        config: DEFAULT_CONFIG,
        format: 'png',
        scale: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');

    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.length).toBeGreaterThan(1000);
    // Verify PNG signature (0x89 0x50 0x4E 0x47)
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
  });

  it('renders a valid SVG directly from client studio payload', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: DEFAULT_REPO,
        config: DEFAULT_CONFIG,
        format: 'svg',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');

    const text = await res.text();
    expect(text).toContain('<svg');
  });

  it('renders @2x scale PNG cleanly', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: DEFAULT_REPO,
        config: DEFAULT_CONFIG,
        format: 'png',
        scale: 2,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');

    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.length).toBeGreaterThan(2000);
  });

  it('renders card with contentAlign: "center" and custom visibility flags', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: DEFAULT_REPO,
        config: {
          ...DEFAULT_CONFIG,
          contentAlign: 'center',
          visibility: {
            ...DEFAULT_CONFIG.visibility,
            author: false,
            tagline: false,
            installCommand: false,
          },
        },
        format: 'svg',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');

    const svg = await res.text();
    expect(svg).toContain('<svg');
    expect(svg).not.toContain(DEFAULT_REPO.owner.login);
    expect(svg).not.toContain(DEFAULT_CONFIG.tagline);
  });

  it('rejects invalid or malformed payload with 400 Bad Request', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: { invalid: true },
        config: null,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('sanitizes customBackgroundUrl and customLogoUrl against SSRF', async () => {
    const validPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const req = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: DEFAULT_REPO,
        config: {
          ...DEFAULT_CONFIG,
          customLogoUrl: 'http://169.254.169.254/latest/meta-data',
          customBackgroundUrl: validPng,
          backgroundPattern: {
            id: 'custom-image',
            opacity: 0.5,
          },
        },
        format: 'svg',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const svg = await res.text();
    expect(svg).not.toContain('169.254.169.254');
    expect(svg).toContain(validPng);
  });

  it('embeds description emojis in downloaded SVG and PNG exports via /api/card/render', async () => {
    const emojiDescription = '🚀 Instant GitHub cards ✨ built for developers ❤️';
    const svgReq = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: {
          ...DEFAULT_REPO,
          description: emojiDescription,
        },
        config: {
          ...DEFAULT_CONFIG,
          tagline: emojiDescription,
        },
        format: 'svg',
      }),
    });

    const svgRes = await POST(svgReq);
    expect(svgRes.status).toBe(200);
    const svg = await svgRes.text();
    const embeddedEmojiCount = (svg.match(/data:image\/svg\+xml;base64,/g) || []).length;
    expect(embeddedEmojiCount).toBeGreaterThanOrEqual(3);

    const pngReq = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo: {
          ...DEFAULT_REPO,
          description: emojiDescription,
        },
        config: {
          ...DEFAULT_CONFIG,
          tagline: emojiDescription,
        },
        format: 'png',
        scale: 1,
      }),
    });

    const pngRes = await POST(pngReq);
    expect(pngRes.status).toBe(200);
    const pngBuf = Buffer.from(await pngRes.arrayBuffer());
    expect(pngBuf[0]).toBe(0x89);
    expect(pngBuf[1]).toBe(0x50);
  });
});
