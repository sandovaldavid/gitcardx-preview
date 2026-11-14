import { NextRequest } from 'next/server';
import { GitHubService, normalizeLicenseLabel } from '@/core/services/GitHubService';
import { renderCardToSvg, renderCardToPng } from '@/cards/engine/satoriRenderer';
import type { RepoMetadata } from '@/core/domain/schemas';
import { parseCardConfigFromSearchParams } from '@/core/domain/cardUrl';
import { isValidGitHubOwner, isValidGitHubRepo } from '@/core/domain/parser';
import { sanitizeImageUrl } from '@/core/security/ssrf';
import { escapeXml } from '@/core/security/xml';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit';

export const maxDuration = 30;

const githubService = new GitHubService();

interface RouteContext {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`card-get:${ip}`, 120, 60_000);
  const rlHeaders = rateLimitHeaders(limit);
  if (!limit.allowed) {
    return new Response('Too many requests. Please retry shortly.', {
      status: 429,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        ...rlHeaders,
      },
    });
  }

  const { owner, repo: rawRepo } = await params;

  // Support extensions in repo name like /api/card/owner/repo.png or repo.svg
  let repo = rawRepo;
  let inferredFormat: 'png' | 'svg' | null = null;
  if (repo.endsWith('.png')) {
    repo = repo.slice(0, -4);
    inferredFormat = 'png';
  } else if (repo.endsWith('.svg')) {
    repo = repo.slice(0, -4);
    inferredFormat = 'svg';
  }

  if (!isValidGitHubOwner(owner) || !isValidGitHubRepo(repo)) {
    return new Response('Invalid GitHub owner or repository name.', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        ...rlHeaders,
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const requestedFormat = searchParams.get('format');
  const format = inferredFormat || (requestedFormat === 'svg' ? 'svg' : 'png');
  const scale = searchParams.get('scale') === '2' ? 2 : 1;

  // Fetch or create fallback RepoMetadata
  let repoMetadata: RepoMetadata;
  let degraded = false;
  try {
    const fetched = await githubService.getRepository(owner, repo);
    // Sanitize image URLs with anti-SSRF defense and drop placeholder license tokens
    repoMetadata = {
      ...fetched,
      license: normalizeLicenseLabel({ spdxId: fetched.license }),
      owner: {
        ...fetched.owner,
        avatarUrl: sanitizeImageUrl(
          fetched.owner.avatarUrl,
          `https://avatars.githubusercontent.com/${owner}`
        ),
      },
      contributors: fetched.contributors.map((c) => ({
        ...c,
        avatarUrl: sanitizeImageUrl(
          c.avatarUrl,
          `https://avatars.githubusercontent.com/${c.login}`
        ),
      })),
    };
  } catch (error) {
    degraded = true;
    console.warn(`Fallback card rendered for ${owner}/${repo}:`, error);
    repoMetadata = {
      owner: {
        login: owner,
        avatarUrl: `https://avatars.githubusercontent.com/${owner}`,
        isOrg: false,
      },
      name: repo,
      description: 'GitHub Social Preview card generated with Gitframe',
      homepageUrl: null,
      stars: 0,
      forks: 0,
      primaryLanguage: null,
      languages: [],
      topics: [],
      license: null,
      latestRelease: null,
      contributors: [],
      contributorsCount: undefined,
      openIssuesCount: undefined,
      discussionsCount: undefined,
    };
  }

  // Build CardConfig from query params. Clamp and validate every free-form value
  // inside parseCardConfigFromSearchParams before reaching Satori/Resvg.
  const cardConfig = parseCardConfigFromSearchParams(searchParams, repoMetadata);

  const headers = {
    'Cache-Control': degraded
      ? 'public, s-maxage=60, stale-while-revalidate=300'
      : 'public, s-maxage=86400, stale-while-revalidate=604800',
    'Content-Type': format === 'svg' ? 'image/svg+xml; charset=utf-8' : 'image/png',
    'X-Content-Type-Options': 'nosniff',
    ...(degraded ? { 'X-Gitframe-Degraded': '1' } : {}),
    ...rlHeaders,
  };

  try {
    if (format === 'svg') {
      const svg = await renderCardToSvg(repoMetadata, cardConfig);
      return new Response(svg, { status: 200, headers });
    }

    const png = await renderCardToPng(repoMetadata, cardConfig, scale);
    return new Response(new Uint8Array(png), { status: 200, headers });
  } catch (renderError) {
    console.error('Failed to render card in /api/card:', renderError);
    // Emergency inline SVG response if Satori/Resvg fails. Keep it cache-free and
    // script-free so a renderer failure cannot turn into a same-origin XSS.
    const fallbackLabel = escapeXml(`${owner}/${repo}`);
    const fallbackSvg = `<svg width="1280" height="640" viewBox="0 0 1280 640" xmlns="http://www.w3.org/2000/svg">
      <rect width="1280" height="640" fill="#090d16"/>
      <text x="640" y="320" font-family="sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">${fallbackLabel}</text>
    </svg>`;
    return new Response(fallbackSvg, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'X-Content-Type-Options': 'nosniff',
        'X-Gitframe-Degraded': '1',
        ...rlHeaders,
      },
    });
  }
}
