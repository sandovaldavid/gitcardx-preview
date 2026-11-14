import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockGetUserRepositories } = vi.hoisted(() => ({
  mockGetUserRepositories: vi.fn(),
}));

vi.mock('@/core/services/GitHubService', () => ({
  GitHubService: class {
    getUserRepositories = mockGetUserRepositories;
  },
}));

import { GET } from '@/app/api/github/repos/route';
import { resetRateLimitForTesting } from '@/lib/rateLimit';

describe('GET /api/github/repos', () => {
  beforeEach(() => {
    resetRateLimitForTesting();
    mockGetUserRepositories.mockReset();
  });

  it('rejects missing owner and input parameters with 400', async () => {
    const req = new NextRequest('https://gitframe.dev/api/github/repos');
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(mockGetUserRepositories).not.toHaveBeenCalled();
  });

  it('rejects malformed owner strings with 400 before invoking GitHubService', async () => {
    const invalidOwners = [
      '-leading-hyphen',
      'trailing-',
      'double--dash',
      '../secret',
      'a'.repeat(40),
    ];

    for (const badOwner of invalidOwners) {
      const req = new NextRequest(
        `https://gitframe.dev/api/github/repos?owner=${encodeURIComponent(badOwner)}`
      );
      const res = await GET(req);
      expect(res.status).toBe(400);
    }

    expect(mockGetUserRepositories).not.toHaveBeenCalled();
  });

  it('rejects non-GitHub input URLs with 400', async () => {
    const req = new NextRequest(
      'https://gitframe.dev/api/github/repos?input=https%3A%2F%2Fevil.example.com%2Fuser'
    );
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(mockGetUserRepositories).not.toHaveBeenCalled();
  });

  it('fetches repositories for valid owner or repository input', async () => {
    mockGetUserRepositories.mockResolvedValue([
      {
        name: 'gitframe',
        description: 'Social card generator',
        stars: 10,
        primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
        updatedAt: '2026-11-13T00:00:00Z',
      },
    ]);

    const req = new NextRequest(
      'https://gitframe.dev/api/github/repos?input=sandovaldavid%2Fgitframe'
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockGetUserRepositories).toHaveBeenCalledWith('sandovaldavid');
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].name).toBe('gitframe');
  });
});
