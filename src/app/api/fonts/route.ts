import { NextRequest, NextResponse } from 'next/server';
import { searchFontCatalog } from '@/cards/fonts/fontCatalogService';
import type { FontRole } from '@/cards/fonts/fontCatalog';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit';

export const maxDuration = 10;

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`fonts:${ip}`, 120, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please retry shortly.' },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  const { searchParams } = request.nextUrl;
  const rawRole = searchParams.get('role');
  const role: FontRole =
    rawRole === 'heading' || rawRole === 'mono' || rawRole === 'all' ? rawRole : 'all';
  const query = (searchParams.get('q') || '').slice(0, 64);
  const rawLimit = Number(searchParams.get('limit') || 40);
  const limitCount = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 80)
    : 40;

  const result = await searchFontCatalog({ role, query, limit: limitCount });

  return NextResponse.json(result, {
    headers: {
      'Cache-Control':
        result.source === 'fontsource'
          ? 'public, s-maxage=86400, stale-while-revalidate=604800'
          : 'public, s-maxage=300, stale-while-revalidate=600',
      ...rateLimitHeaders(limit),
    },
  });
}
