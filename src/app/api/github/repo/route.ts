import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubInput } from '@/core/domain/parser';
import { GitHubService } from '@/core/services/GitHubService';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit';

export const maxDuration = 10;

const githubService = new GitHubService();

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`github-repo:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please retry shortly.' },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  let owner = searchParams.get('owner');
  let repo = searchParams.get('repo');

  if (input) {
    const parsed = parseGitHubInput(input);
    if (parsed.type === 'repo') {
      owner = parsed.owner;
      repo = parsed.repo;
    } else {
      return NextResponse.json(
        { error: parsed.type === 'invalid' ? parsed.error : 'Input is not a repository' },
        { status: 400, headers: rateLimitHeaders(limit) }
      );
    }
  }

  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'Missing owner or repo query parameters' },
      { status: 400, headers: rateLimitHeaders(limit) }
    );
  }

  try {
    const metadata = await githubService.getRepository(owner, repo);
    return NextResponse.json(metadata, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        ...rateLimitHeaders(limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown GitHub error';
    console.error('Failed to fetch repository metadata:', message);
    const isNotFound = message.includes('not found') || message.includes('private');
    const isRateLimit = message.includes('rate limit');

    return NextResponse.json(
      {
        error: isNotFound
          ? 'Repository not found or private.'
          : isRateLimit
            ? 'GitHub API rate limit exceeded. Please try again shortly.'
            : 'Failed to fetch repository metadata.',
      },
      { status: isNotFound ? 404 : isRateLimit ? 429 : 502, headers: rateLimitHeaders(limit) }
    );
  }
}
