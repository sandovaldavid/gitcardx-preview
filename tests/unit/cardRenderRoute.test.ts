import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/card/render/route';
import { resetRateLimitForTesting } from '@/lib/rateLimit';
import { DEFAULT_REPO, DEFAULT_CONFIG } from '@/studio/state/useCardStore';

describe('On-Demand Card Render Route (/api/card/render)', () => {
  beforeEach(() => {
    resetRateLimitForTesting();
  });
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
    expect(res.headers.get('Content-Security-Policy')).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; sandbox"
    );

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

  it('exports Studio image uploads larger than 150 KB up to the 500 KB budget', async () => {
    const paddedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><!-- ${'a'.repeat(190_000)} --></svg>`;
    const largeUploadDataUri = `data:image/svg+xml;base64,${Buffer.from(paddedSvg, 'utf8').toString('base64')}`;
    expect(largeUploadDataUri.length).toBeGreaterThan(250_000);

    const req = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '203.0.113.77',
      },
      body: JSON.stringify({
        repo: DEFAULT_REPO,
        config: {
          ...DEFAULT_CONFIG,
          customBackgroundUrl: largeUploadDataUri,
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
    expect(svg).toContain(largeUploadDataUri);
  });

  it('rejects non-JSON content types and malformed JSON with client errors', async () => {
    const textReq = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not json',
    });
    expect((await POST(textReq)).status).toBe(415);

    const malformedReq = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad',
    });
    expect((await POST(malformedReq)).status).toBe(400);
  });

  it('rejects oversized bodies via Content-Length, spoofed Content-Length, or chunked streams with 413', async () => {
    const declaredReq = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(900_000),
        'x-real-ip': '203.0.113.55',
      },
      body: '{}',
    });
    expect((await POST(declaredReq)).status).toBe(413);

    const oversizedPayload = JSON.stringify({ filler: 'a'.repeat(820_000) });
    const spoofedHeaderReq = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '64',
        'x-real-ip': '203.0.113.55',
      },
      body: oversizedPayload,
    });
    expect((await POST(spoofedHeaderReq)).status).toBe(413);

    const encoder = new TextEncoder();
    const chunkedStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"filler":"'));
        controller.enqueue(encoder.encode('b'.repeat(420_000)));
        controller.enqueue(encoder.encode('b'.repeat(420_000)));
        controller.enqueue(encoder.encode('"}'));
        controller.close();
      },
    });
    const streamReq = new NextRequest('https://gitframe.dev/api/card/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': '203.0.113.55',
      },
      body: chunkedStream,
      duplex: 'half',
    });
    expect((await POST(streamReq)).status).toBe(413);
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
