import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubInput } from '@/core/domain/parser';
import { GitHubService } from '@/core/services/GitHubService';

const githubService = new GitHubService();

export async function GET(request: NextRequest) {
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
        { status: 400 }
      );
    }
  }

  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'Missing owner or repo query parameters' },
      { status: 400 }
    );
  }

  try {
    const metadata = await githubService.getRepository(owner, repo);
    return NextResponse.json(metadata, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch repository metadata';
    const isNotFound = message.includes('not found') || message.includes('private');
    const isRateLimit = message.includes('rate limit');

    return NextResponse.json(
      { error: message },
      {
        status: isNotFound ? 404 : isRateLimit ? 429 : 500,
      }
    );
  }
}
