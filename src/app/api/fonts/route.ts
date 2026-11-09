import { NextRequest, NextResponse } from 'next/server';
import { searchFontCatalog } from '@/cards/fonts/fontCatalogService';
import type { FontRole } from '@/cards/fonts/fontCatalog';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawRole = searchParams.get('role');
  const role: FontRole =
    rawRole === 'heading' || rawRole === 'mono' || rawRole === 'all' ? rawRole : 'all';
  const query = (searchParams.get('q') || '').slice(0, 64);
  const rawLimit = Number(searchParams.get('limit') || 40);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 80) : 40;

  const result = await searchFontCatalog({ role, query, limit });

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
