import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubInput } from '@/core/domain/parser';
import { GitHubService } from '@/core/services/GitHubService';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit';

export const maxDuration = 10;

const githubService = new GitHubService();

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`github-repos:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please retry shortly.' },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  let owner = searchParams.get('owner') || searchParams.get('user');

  if (input) {
    const parsed = parseGitHubInput(input);
    if (parsed.type === 'owner') {
      owner = parsed.owner;
    } else if (parsed.type === 'repo') {
      owner = parsed.owner;
    }
  }

  if (!owner) {
    return NextResponse.json(
      { error: 'Missing owner or input query parameter' },
      { status: 400, headers: rateLimitHeaders(limit) }
    );
  }

  try {
    const repos = await githubService.getUserRepositories(owner);
    return NextResponse.json(repos, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        ...rateLimitHeaders(limit),
      },
    });
  } catch (error: unknown) {
    console.error('Failed to fetch user repositories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user repositories.' },
      { status: 502, headers: rateLimitHeaders(limit) }
    );
  }
}
