import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubService } from '@/core/services/GitHubService';

const mockGraphql = vi.fn();

vi.mock('octokit', () => {
  return {
    Octokit: class {
      graphql = mockGraphql;
    },
  };
});

describe('GitHubService', () => {
  let service: GitHubService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    GitHubService.clearCache();
    service = new GitHubService('mock-token');
  });

  describe('getRepository', () => {
    it('fetches and maps full repository metadata correctly', async () => {
      mockGraphql.mockResolvedValueOnce({
        repository: {
          name: 'gitframe',
          description: 'GitHub Social Preview card generator',
          homepageUrl: 'https://gitframe.dev',
          stargazerCount: 120,
          forkCount: 15,
          isArchived: false,
          owner: {
            __typename: 'User',
            login: 'sandovaldavid',
            avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
          },
          primaryLanguage: {
            name: 'TypeScript',
            color: '#3178C6',
          },
          languages: {
            edges: [
              { size: 85000, node: { name: 'TypeScript', color: '#3178C6' } },
              { size: 15000, node: { name: 'CSS', color: '#1572B6' } },
            ],
          },
          repositoryTopics: {
            nodes: [{ topic: { name: 'nextjs' } }, { topic: { name: 'social-preview' } }],
          },
          licenseInfo: {
            spdxId: 'MIT',
          },
          latestRelease: {
            tagName: 'v1.0.0',
            publishedAt: '2026-11-01T12:00:00Z',
          },
          mentionableUsers: {
            nodes: [
              {
                login: 'sandovaldavid',
                avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
              },
            ],
          },
        },
      });

      const repo = await service.getRepository('sandovaldavid', 'gitframe');

      expect(repo.name).toBe('gitframe');
      expect(repo.owner.login).toBe('sandovaldavid');
      expect(repo.owner.isOrg).toBe(false);
      expect(repo.stars).toBe(120);
      expect(repo.forks).toBe(15);
      expect(repo.primaryLanguage?.name).toBe('TypeScript');
      expect(repo.languages.length).toBe(2);
      expect(repo.topics).toEqual(['nextjs', 'social-preview']);
      expect(repo.license).toBe('MIT');
      expect(repo.latestRelease?.tag).toBe('v1.0.0');
      expect(repo.contributors.length).toBe(1);
    });

    it('handles nullable fields gracefully (no release, no license, no primary language)', async () => {
      mockGraphql.mockResolvedValueOnce({
        repository: {
          name: 'minimal-repo',
          description: null,
          homepageUrl: null,
          stargazerCount: 0,
          forkCount: 0,
          isArchived: false,
          owner: {
            __typename: 'Organization',
            login: 'test-org',
            avatarUrl: 'https://avatars.githubusercontent.com/u/99999',
          },
          primaryLanguage: null,
          languages: { edges: [] },
          repositoryTopics: { nodes: [] },
          licenseInfo: null,
          latestRelease: null,
          mentionableUsers: { nodes: [] },
        },
      });

      const repo = await service.getRepository('test-org', 'minimal-repo');

      expect(repo.owner.isOrg).toBe(true);
      expect(repo.description).toBeNull();
      expect(repo.primaryLanguage).toBeNull();
      expect(repo.license).toBeNull();
      expect(repo.latestRelease).toBeNull();
      expect(repo.contributors).toEqual([]);
    });

    it('throws friendly error when repository is not found or private', async () => {
      mockGraphql.mockRejectedValueOnce(
        new Error('Could not resolve to a Repository with the name of nonexistent/repo.')
      );

      await expect(service.getRepository('nonexistent', 'repo')).rejects.toThrow(
        "Repository 'nonexistent/repo' was not found or is private."
      );
    });

    it('rejects private repositories returned by GraphQL', async () => {
      mockGraphql.mockResolvedValueOnce({ repository: { isPrivate: true } });

      await expect(service.getRepository('acme', 'secret')).rejects.toThrow(
        "Repository 'acme/secret' was not found or is private."
      );
    });

    it('rejects private repositories returned by the REST fallback', async () => {
      mockGraphql.mockRejectedValueOnce(
        new Error('Request quota exhausted for request POST /graphql')
      );
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ private: true }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(service.getRepository('acme', 'secret')).rejects.toThrow(
        "Repository 'acme/secret' was not found or is private."
      );
    });

    it('throws friendly error when rate limit is exceeded on both GraphQL and REST', async () => {
      mockGraphql.mockRejectedValueOnce(new Error('API rate limit exceeded for user ID 12345.'));
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
      vi.stubGlobal('fetch', mockFetch);

      await expect(service.getRepository('unknown-random', 'random-repo')).rejects.toThrow(
        'GitHub API rate limit exceeded. Please try again shortly.'
      );
    });

    it('falls back to REST API seamlessly when GraphQL quota is exhausted and caches response', async () => {
      mockGraphql.mockRejectedValueOnce(
        new Error('Request quota exhausted for request POST /graphql')
      );
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'my-project',
          owner: {
            login: 'dev-user',
            avatar_url: 'https://avatars.githubusercontent.com/u/999',
            type: 'User',
          },
          description: 'A resilient project',
          homepage: null,
          stargazers_count: 55,
          forks_count: 5,
          language: 'Go',
          topics: ['tools'],
          license: { spdx_id: 'MIT' },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const repo = await service.getRepository('dev-user', 'my-project');
      expect(repo.name).toBe('my-project');
      expect(repo.stars).toBe(55);
      expect(repo.primaryLanguage?.name).toBe('Go');

      // Subsequent call should hit cache without calling GraphQL or fetch again
      mockGraphql.mockClear();
      mockFetch.mockClear();

      const cachedRepo = await service.getRepository('dev-user', 'my-project');
      expect(cachedRepo.name).toBe('my-project');
      expect(mockGraphql).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns known emergency fallback for showcase repo when completely rate limited', async () => {
      mockGraphql.mockRejectedValueOnce(new Error('API rate limit exceeded'));
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
      vi.stubGlobal('fetch', mockFetch);

      const repo = await service.getRepository('sandovaldavid', 'portfolio');
      expect(repo.name).toBe('portfolio');
      expect(repo.stars).toBe(1);
      expect(repo.primaryLanguage?.name).toBe('TypeScript');
    });

    it('fetches via REST API v3 when no auth token is provided', async () => {
      const unauthService = new GitHubService('');
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'portfolio',
          owner: {
            login: 'sandovaldavid',
            avatar_url: 'https://avatars.githubusercontent.com/u/102970701',
            type: 'User',
          },
          description: "Portfolio's David",
          homepage: 'https://sandovaldavid.com',
          stargazers_count: 8,
          forks_count: 2,
          language: 'TypeScript',
          topics: ['portfolio', 'nextjs'],
          license: { spdx_id: 'MIT' },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const repo = await unauthService.getRepository('sandovaldavid', 'portfolio');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/sandovaldavid/portfolio',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/vnd.github.v3+json',
          }),
        })
      );
      expect(repo.name).toBe('portfolio');
      expect(repo.stars).toBe(8);
      expect(repo.primaryLanguage?.name).toBe('TypeScript');
      expect(repo.primaryLanguage?.color).toBe('#3178C6');
      expect(repo.topics).toEqual(['portfolio', 'nextjs']);

      vi.unstubAllGlobals();
    });

    it('handles REST API 404 in unauthenticated mode', async () => {
      const unauthService = new GitHubService('');
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(unauthService.getRepository('nobody', 'missing')).rejects.toThrow(
        "Repository 'nobody/missing' was not found or is private."
      );

      vi.unstubAllGlobals();
    });

    it('filters out anonymous contributors lacking login/avatar_url in REST mode', async () => {
      const unauthService = new GitHubService('');
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            name: 'anon-contrib-repo',
            description: 'Repo with anonymous git contributor',
            homepage: null,
            stargazers_count: 100,
            forks_count: 10,
            open_issues_count: 2,
            has_issues: true,
            has_discussions: false,
            language: 'JavaScript',
            topics: ['react'],
            license: { spdx_id: 'MIT' },
            owner: {
              login: 'acme',
              avatar_url: 'https://avatars.githubusercontent.com/u/1',
              type: 'Organization',
            },
          }),
        })
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ JavaScript: 12000 }) })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => [
            { login: 'alice', avatar_url: 'https://avatars.githubusercontent.com/u/2' },
            { type: 'Anonymous', name: 'Legacy Bot', contributions: 42 },
          ],
        });
      vi.stubGlobal('fetch', mockFetch);

      const metadata = await unauthService.getRepository('acme', 'anon-contrib-repo');
      expect(metadata.contributors).toEqual([
        { login: 'alice', avatarUrl: 'https://avatars.githubusercontent.com/u/2' },
      ]);
      expect(metadata.contributorsCount).toBe(2);

      vi.unstubAllGlobals();
    });
  });

  describe('getUserRepositories', () => {
    it('returns autocomplete list from user repositories', async () => {
      mockGraphql.mockResolvedValueOnce({
        user: {
          repositories: {
            nodes: [
              {
                name: 'cool-project',
                description: 'A very cool project',
                stargazerCount: 42,
                primaryLanguage: { name: 'Rust', color: '#DEA584' },
                updatedAt: '2026-11-05T10:00:00Z',
              },
            ],
          },
        },
        organization: null,
      });

      const repos = await service.getUserRepositories('sandovaldavid');
      expect(repos.length).toBe(1);
      expect(repos[0].name).toBe('cool-project');
      expect(repos[0].stars).toBe(42);
    });

    it('returns empty array when GraphQL query fails', async () => {
      mockGraphql.mockRejectedValueOnce(new Error('User does not exist'));

      const repos = await service.getUserRepositories('unknown-user');
      expect(repos).toEqual([]);
    });

    it('fetches autocomplete list via REST API when unauthenticated', async () => {
      const unauthService = new GitHubService('');
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          {
            name: 'rest-repo',
            description: 'From REST API',
            stargazers_count: 15,
            language: 'Python',
            updated_at: '2026-11-07T12:00:00Z',
            private: false,
          },
          {
            name: 'private-repo',
            description: 'Must not leak',
            stargazers_count: 1,
            language: 'TypeScript',
            updated_at: '2026-11-07T12:00:00Z',
            private: true,
          },
        ],
      });
      vi.stubGlobal('fetch', mockFetch);

      const repos = await unauthService.getUserRepositories('sandovaldavid');
      expect(repos.length).toBe(1);
      expect(repos[0].name).toBe('rest-repo');
      expect(repos[0].stars).toBe(15);
      expect(repos[0].primaryLanguage?.name).toBe('Python');

      vi.unstubAllGlobals();
    });
  });
});
