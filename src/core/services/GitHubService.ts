import { Octokit } from 'octokit';
import { RepoMetadataSchema, type RepoMetadata } from '../domain/schemas';

export interface RepoAutocompleteItem {
  name: string;
  description: string | null;
  stars: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  updatedAt: string;
}

const GET_REPO_QUERY = `
  query GetRepoCardMetadata($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      description
      homepageUrl
      stargazerCount
      forkCount
      isArchived
      owner {
        __typename
        login
        avatarUrl(size: 256)
      }
      primaryLanguage {
        name
        color
      }
      languages(first: 4, orderBy: { field: SIZE, direction: DESC }) {
        edges {
          size
          node {
            name
            color
          }
        }
      }
      repositoryTopics(first: 8) {
        nodes {
          topic {
            name
          }
        }
      }
      licenseInfo {
        spdxId
      }
      latestRelease {
        tagName
        publishedAt
      }
      mentionableUsers(first: 5) {
        nodes {
          login
          avatarUrl(size: 96)
        }
      }
    }
  }
`;

const GET_USER_REPOS_QUERY = `
  query GetUserPublicRepos($login: String!) {
    user(login: $login) {
      repositories(first: 15, privacy: PUBLIC, orderBy: { field: STARGAZERS, direction: DESC }) {
        nodes {
          name
          description
          stargazerCount
          primaryLanguage {
            name
            color
          }
          updatedAt
        }
      }
    }
    organization(login: $login) {
      repositories(first: 15, privacy: PUBLIC, orderBy: { field: STARGAZERS, direction: DESC }) {
        nodes {
          name
          description
          stargazerCount
          primaryLanguage {
            name
            color
          }
          updatedAt
        }
      }
    }
  }
`;

const COMMON_LANGUAGE_COLORS: Record<string, string> = {
  typescript: '#3178C6',
  javascript: '#F7DF1E',
  python: '#3776AB',
  rust: '#DEA584',
  go: '#00ADD8',
  html: '#E34F26',
  css: '#1572B6',
  java: '#ED8B00',
  c: '#A8B9CC',
  'c++': '#00599C',
  'c#': '#239120',
  ruby: '#CC342D',
  php: '#777BB4',
  swift: '#F05138',
  kotlin: '#7F52FF',
  dart: '#0175C2',
  elixir: '#4B275F',
  shell: '#89E051',
  vue: '#41B883',
  svelte: '#FF3E00',
  scala: '#DC322F',
  r: '#276DC3',
  lua: '#000080',
};

function getLanguageColor(name: string): string {
  const normalized = name.toLowerCase().trim();
  return COMMON_LANGUAGE_COLORS[normalized] || '#3178C6';
}

export class GitHubService {
  private octokit: Octokit;
  private authToken: string | undefined;

  constructor(token?: string) {
    this.authToken = token || process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({
      auth: this.authToken || undefined,
    });
  }

  /**
   * Fallback using GitHub REST API v3 when GraphQL is unavailable, unauthenticated,
   * or rate-limited. Works with public repositories without mandatory auth tokens.
   */
  async fetchFromRestApi(owner: string, repo: string): Promise<RepoMetadata> {
    const headers: Record<string, string> = {
      'User-Agent': 'GitCardX-Preview',
      Accept: 'application/vnd.github.v3+json',
    };
    if (this.authToken) {
      headers.Authorization = `token ${this.authToken}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { headers }
    );

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Repository '${owner}/${repo}' was not found or is private.`);
      }
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        throw new Error('GitHub API rate limit exceeded. Please try again shortly.');
      }
      throw new Error(`GitHub REST API returned status ${res.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (await res.json()) as any;
    const langName: string | null = raw.language || null;
    const langColor = langName ? getLanguageColor(langName) : null;

    const metadata: RepoMetadata = {
      owner: {
        login: raw.owner.login,
        avatarUrl: raw.owner.avatar_url,
        isOrg: raw.owner.type === 'Organization',
      },
      name: raw.name,
      description: raw.description || null,
      homepageUrl: raw.homepage || null,
      stars: typeof raw.stargazers_count === 'number' ? raw.stargazers_count : 0,
      forks: typeof raw.forks_count === 'number' ? raw.forks_count : 0,
      primaryLanguage: langName
        ? {
            name: langName,
            color: langColor || '#3178C6',
          }
        : null,
      languages: langName
        ? [
            {
              name: langName,
              color: langColor || '#3178C6',
              size: raw.size || 1000,
            },
          ]
        : [],
      topics: Array.isArray(raw.topics) ? raw.topics : [],
      license: raw.license?.spdx_id || raw.license?.name || null,
      latestRelease: null,
      contributors: [
        {
          login: raw.owner.login,
          avatarUrl: raw.owner.avatar_url,
        },
      ],
    };

    return RepoMetadataSchema.parse(metadata);
  }

  /**
   * Fallback using GitHub REST API v3 for user/org repository autocomplete.
   */
  private async fetchUserReposFromRestApi(login: string): Promise<RepoAutocompleteItem[]> {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'GitCardX-Preview',
        Accept: 'application/vnd.github.v3+json',
      };
      if (this.authToken) {
        headers.Authorization = `token ${this.authToken}`;
      }

      let res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(login)}/repos?sort=updated&per_page=15`,
        { headers }
      );
      if (!res.ok && res.status === 404) {
        res = await fetch(
          `https://api.github.com/orgs/${encodeURIComponent(login)}/repos?sort=updated&per_page=15`,
          { headers }
        );
      }
      if (!res.ok) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await res.json()) as any;
      if (!Array.isArray(data)) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((item: any) => ({
        name: item.name,
        description: item.description,
        stars: item.stargazers_count ?? 0,
        primaryLanguage: item.language
          ? {
              name: item.language,
              color: getLanguageColor(item.language),
            }
          : null,
        updatedAt: item.updated_at,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetches rich metadata for a given GitHub repository using GraphQL v4 with REST API v3 fallback.
   */
  async getRepository(owner: string, repo: string): Promise<RepoMetadata> {
    if (!this.authToken) {
      return this.fetchFromRestApi(owner, repo);
    }

    try {
      const response = await this.octokit.graphql<{
        repository: {
          name: string;
          description: string | null;
          homepageUrl: string | null;
          stargazerCount: number;
          forkCount: number;
          isArchived: boolean;
          owner: {
            __typename: string;
            login: string;
            avatarUrl: string;
          };
          primaryLanguage: {
            name: string;
            color: string;
          } | null;
          languages: {
            edges: Array<{
              size: number;
              node: {
                name: string;
                color: string;
              };
            }>;
          };
          repositoryTopics: {
            nodes: Array<{
              topic: {
                name: string;
              };
            }>;
          };
          licenseInfo: {
            spdxId: string;
          } | null;
          latestRelease: {
            tagName: string;
            publishedAt: string;
          } | null;
          mentionableUsers: {
            nodes: Array<{
              login: string;
              avatarUrl: string;
            }>;
          };
        } | null;
      }>(GET_REPO_QUERY, {
        owner,
        name: repo,
      });

      if (!response || !response.repository) {
        throw new Error(`Repository '${owner}/${repo}' was not found or is private.`);
      }

      const raw = response.repository;

      const metadata: RepoMetadata = {
        owner: {
          login: raw.owner.login,
          avatarUrl: raw.owner.avatarUrl,
          isOrg: raw.owner.__typename === 'Organization',
        },
        name: raw.name,
        description: raw.description,
        homepageUrl: raw.homepageUrl,
        stars: raw.stargazerCount,
        forks: raw.forkCount,
        primaryLanguage: raw.primaryLanguage
          ? {
              name: raw.primaryLanguage.name,
              color: raw.primaryLanguage.color,
            }
          : null,
        languages: (raw.languages?.edges || []).map((e) => ({
          name: e.node.name,
          color: e.node.color,
          size: e.size,
        })),
        topics: (raw.repositoryTopics?.nodes || []).map((n) => n.topic.name),
        license: raw.licenseInfo?.spdxId || null,
        latestRelease: raw.latestRelease
          ? {
              tag: raw.latestRelease.tagName,
              publishedAt: raw.latestRelease.publishedAt,
            }
          : null,
        contributors: (raw.mentionableUsers?.nodes || []).map((u) => ({
          login: u.login,
          avatarUrl: u.avatarUrl,
        })),
      };

      return RepoMetadataSchema.parse(metadata);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Could not resolve to a Repository') || message.includes('404')) {
        throw new Error(`Repository '${owner}/${repo}' was not found or is private.`);
      }

      // If GraphQL query fails (unauthenticated, rate limit, quota exhausted), fallback to REST API
      try {
        return await this.fetchFromRestApi(owner, repo);
      } catch (restError: unknown) {
        const restMessage = restError instanceof Error ? restError.message : String(restError);
        if (restMessage.includes('not found') || restMessage.includes('private')) {
          throw new Error(`Repository '${owner}/${repo}' was not found or is private.`);
        }
        if (
          restMessage.includes('rate limit') ||
          restMessage.includes('403') ||
          restMessage.includes('401') ||
          restMessage.includes('429')
        ) {
          throw new Error(`GitHub API rate limit exceeded. Please try again shortly.`);
        }
        throw restError;
      }
    }
  }

  /**
   * Fetches public repositories for a given user or organization for autocomplete.
   */
  async getUserRepositories(login: string): Promise<RepoAutocompleteItem[]> {
    if (!this.authToken) {
      return this.fetchUserReposFromRestApi(login);
    }

    try {
      const response = await this.octokit.graphql<{
        user?: {
          repositories: {
            nodes: Array<{
              name: string;
              description: string | null;
              stargazerCount: number;
              primaryLanguage: { name: string; color: string } | null;
              updatedAt: string;
            }>;
          };
        } | null;
        organization?: {
          repositories: {
            nodes: Array<{
              name: string;
              description: string | null;
              stargazerCount: number;
              primaryLanguage: { name: string; color: string } | null;
              updatedAt: string;
            }>;
          };
        } | null;
      }>(GET_USER_REPOS_QUERY, { login });

      const nodes =
        response.organization?.repositories?.nodes || response.user?.repositories?.nodes || [];

      if (nodes.length > 0) {
        return nodes.map((n) => ({
          name: n.name,
          description: n.description,
          stars: n.stargazerCount,
          primaryLanguage: n.primaryLanguage,
          updatedAt: n.updatedAt,
        }));
      }
    } catch {
      // Fall through to REST API fallback
    }

    return await this.fetchUserReposFromRestApi(login);
  }
}
