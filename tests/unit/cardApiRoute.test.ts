import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/card/[owner]/[repo]/route';

// Mock GitHubService
vi.mock('@/core/services/GitHubService', () => {
  return {
    GitHubService: class {
      getRepository = vi.fn().mockImplementation((owner: string, repo: string) => {
        if (owner === 'nonexistent') {
          throw new Error('Repo not found');
        }
        return Promise.resolve({
          owner: {
            login: owner,
            avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
            isOrg: false,
          },
          name: repo,
          description: 'A mock repository for testing the dynamic card route.',
          homepageUrl: 'https://gitframe.dev',
          stars: 450,
          forks: 30,
          primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
          languages: [{ name: 'TypeScript', color: '#3178C6', size: 50000 }],
          topics: ['nextjs', 'vitest'],
          license: 'MIT',
          latestRelease: { tag: 'v1.0.0', publishedAt: '2026-11-01T00:00:00Z' },
          contributors: [
            { login: owner, avatarUrl: 'https://avatars.githubusercontent.com/u/12345' },
          ],
        });
      });
    },
  };
});

describe('Dynamic Card Route (/api/card/[owner]/[repo])', () => {
  it('returns a valid PNG card with Cache-Control headers', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/sandovaldavid/gitframe');
    const res = await GET(req, {
      params: Promise.resolve({ owner: 'sandovaldavid', repo: 'gitframe' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=86400');

    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.length).toBeGreaterThan(1000);
    // Verify PNG header
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
  });

  it('supports .svg extension in repo name to render SVG', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/sandovaldavid/gitframe.svg');
    const res = await GET(req, {
      params: Promise.resolve({ owner: 'sandovaldavid', repo: 'gitframe.svg' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');

    const text = await res.text();
    expect(text.startsWith('<svg')).toBe(true);
    expect(text).toContain('viewBox="0 0 1280 640"');
  });

  it('supports query parameters like format=svg, template, theme=light and accent', async () => {
    const req = new NextRequest(
      'https://gitframe.dev/api/card/sandovaldavid/gitframe?format=svg&template=cli-terminal&theme=light&accent=ff5500'
    );
    const res = await GET(req, {
      params: Promise.resolve({ owner: 'sandovaldavid', repo: 'gitframe' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');
    const text = await res.text();
    expect(text.startsWith('<svg')).toBe(true);
  });

  it('supports custom background options like bg, bg_opacity, bg_scale and bg_url', async () => {
    const req = new NextRequest(
      'https://gitframe.dev/api/card/sandovaldavid/gitframe?format=svg&bg=dot-matrix&bg_scale=2&bg_opacity=0.75'
    );
    const res = await GET(req, {
      params: Promise.resolve({ owner: 'sandovaldavid', repo: 'gitframe' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');
    const text = await res.text();
    expect(text.startsWith('<svg')).toBe(true);
    expect(text).toContain('dot-matrix-pattern');
    expect(text).toContain('width=%2264%22');
  });

  it('renders a fallback card gracefully when repository is not found or fails', async () => {
    const req = new NextRequest('https://gitframe.dev/api/card/nonexistent/missing-repo.svg');
    const res = await GET(req, {
      params: Promise.resolve({ owner: 'nonexistent', repo: 'missing-repo.svg' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');
    const text = await res.text();
    expect(text.startsWith('<svg')).toBe(true);
  });
});
