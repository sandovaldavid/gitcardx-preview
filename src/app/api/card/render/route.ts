import { NextRequest, NextResponse } from 'next/server';
import { renderCardToPng, renderCardToSvg } from '@/cards/engine/satoriRenderer';
import { RepoMetadataSchema, CardConfigSchema, type CardConfig } from '@/core/domain/schemas';
import { sanitizeImageUrl } from '@/core/security/ssrf';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit';

export const maxDuration = 30;

const MAX_BODY_BYTES = 800_000;

class PayloadTooLargeError extends Error {}

async function readTextWithByteLimit(request: Request, maxBytes: number): Promise<string> {
  const bodyStream = request.body;
  if (!bodyStream) {
    return '';
  }

  const reader = bodyStream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new PayloadTooLargeError('Payload too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(combined);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`card-render:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please retry shortly.' },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415, headers: rateLimitHeaders(limit) }
    );
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Payload too large' },
      { status: 413, headers: rateLimitHeaders(limit) }
    );
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await readTextWithByteLimit(request, MAX_BODY_BYTES);
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers: rateLimitHeaders(limit) }
      );
    }
    body = parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413, headers: rateLimitHeaders(limit) }
      );
    }
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: rateLimitHeaders(limit) }
    );
  }

  try {
    const { repo, config, format = 'png', scale = 1 } = body;

    const parsedRepo = RepoMetadataSchema.safeParse(repo);
    const parsedConfig = CardConfigSchema.safeParse(config);

    if (!parsedRepo.success || !parsedConfig.success) {
      return NextResponse.json(
        {
          error: 'Invalid card configuration or repository metadata payload',
          details: {
            repoErrors: parsedRepo.error?.issues,
            configErrors: parsedConfig.error?.issues,
          },
        },
        { status: 400, headers: rateLimitHeaders(limit) }
      );
    }

    const safeRepo = {
      ...parsedRepo.data,
      owner: {
        ...parsedRepo.data.owner,
        avatarUrl: sanitizeImageUrl(
          parsedRepo.data.owner.avatarUrl,
          `https://avatars.githubusercontent.com/${parsedRepo.data.owner.login}`
        ),
      },
      contributors: parsedRepo.data.contributors.map((c) => ({
        ...c,
        avatarUrl: sanitizeImageUrl(
          c.avatarUrl,
          `https://avatars.githubusercontent.com/${c.login}`
        ),
      })),
    };

    const sanitizedLogo = parsedConfig.data.customLogoUrl
      ? sanitizeImageUrl(parsedConfig.data.customLogoUrl) || undefined
      : undefined;
    const sanitizedBg = parsedConfig.data.customBackgroundUrl
      ? sanitizeImageUrl(parsedConfig.data.customBackgroundUrl) || undefined
      : undefined;

    const safeConfig: CardConfig = {
      ...parsedConfig.data,
      customLogoUrl: sanitizedLogo,
      customBackgroundUrl: sanitizedBg,
    };
    const isSvg = format === 'svg';
    const numericScale = Math.min(Math.max(Number(scale) || 1, 1), 2);

    if (isSvg) {
      const svg = await renderCardToSvg(safeRepo, safeConfig);
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          'Cache-Control': 'no-store, max-age=0',
          'X-Content-Type-Options': 'nosniff',
          ...rateLimitHeaders(limit),
        },
      });
    }

    const png = await renderCardToPng(safeRepo, safeConfig, numericScale);
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        ...rateLimitHeaders(limit),
      },
    });
  } catch (error: unknown) {
    console.error('Failed to render card on-demand:', error);
    return NextResponse.json(
      { error: 'Render failed' },
      { status: 500, headers: rateLimitHeaders(limit) }
    );
  }
}
