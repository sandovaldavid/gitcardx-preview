import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubInput } from '@/core/domain/parser';
import { GitHubService } from '@/core/services/GitHubService';

const githubService = new GitHubService();

export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: 'Missing owner or input query parameter' }, { status: 400 });
  }

  try {
    const repos = await githubService.getUserRepositories(owner);
    return NextResponse.json(repos, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user repositories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
