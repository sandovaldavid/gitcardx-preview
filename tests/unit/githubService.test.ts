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
    service = new GitHubService('mock-token');
  });

  describe('getRepository', () => {
    it('fetches and maps full repository metadata correctly', async () => {
      mockGraphql.mockResolvedValueOnce({
        repository: {
          name: 'gitcardx-preview',
          description: 'GitHub Social Preview card generator',
          homepageUrl: 'https://gitcardx.dev',
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
            nodes: [
              { topic: { name: 'nextjs' } },
              { topic: { name: 'social-preview' } },
            ],
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

      const repo = await service.getRepository('sandovaldavid', 'gitcardx-preview');

      expect(repo.name).toBe('gitcardx-preview');
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

      await expect(
        service.getRepository('nonexistent', 'repo')
      ).rejects.toThrow("Repository 'nonexistent/repo' was not found or is private.");
    });

    it('throws friendly error when rate limit is exceeded', async () => {
      mockGraphql.mockRejectedValueOnce(
        new Error('API rate limit exceeded for user ID 12345.')
      );

      await expect(
        service.getRepository('some', 'repo')
      ).rejects.toThrow('GitHub API rate limit exceeded. Please try again shortly.');
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
  });
});
