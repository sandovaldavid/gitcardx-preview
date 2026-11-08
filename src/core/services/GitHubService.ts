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

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory process cache to avoid redundant network round-trips and preserve rate-limit quotas
const repoCache = new Map<string, CacheEntry<RepoMetadata>>();
const userReposCache = new Map<string, CacheEntry<RepoAutocompleteItem[]>>();

// Circuit breaker timestamp: when GraphQL quota is exhausted, disable GraphQL for 15 minutes
let graphQlDisabledUntil = 0;

/**
 * Curated offline / emergency fallbacks for showcase repositories so the landing page
 * and demos never render empty cards even under total GitHub API quota exhaustion.
 */
export const KNOWN_REPO_FALLBACKS: Record<string, RepoMetadata> = {
  'sandovaldavid/portfolio': {
    owner: {
      login: 'sandovaldavid',
      avatarUrl: 'https://avatars.githubusercontent.com/u/102970701',
      isOrg: false,
    },
    name: 'portfolio',
    description: "Portfolio's David",
    homepageUrl: 'https://sandovaldavid.com',
    stars: 8,
    forks: 2,
    primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
    languages: [
      { name: 'TypeScript', color: '#3178C6', size: 372000 },
      { name: 'Astro', color: '#BC52EE', size: 320000 },
      { name: 'JavaScript', color: '#F7DF1E', size: 103000 },
    ],
    topics: ['portfolio', 'nextjs', 'tailwindcss', 'developer-portfolio'],
    license: 'MIT',
    latestRelease: { tag: 'v2.0.1', publishedAt: '2026-11-05T13:00:09Z' },
    contributors: [
      { login: 'sandovaldavid', avatarUrl: 'https://avatars.githubusercontent.com/u/102970701' },
    ],
  },
  'sandovaldavid/gitcardx-preview': {
    owner: {
      login: 'sandovaldavid',
      avatarUrl: 'https://avatars.githubusercontent.com/u/102970701',
      isOrg: false,
    },
    name: 'gitcardx-preview',
    description:
      'Instant GitHub Social Preview card generator for developers. 8 Satori templates, generative backgrounds, zero sign-up.',
    homepageUrl: 'https://gitcardx.dev',
    stars: 1250,
    forks: 180,
    primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
    languages: [
      { name: 'TypeScript', color: '#3178C6', size: 85000 },
      { name: 'CSS', color: '#1572B6', size: 15000 },
    ],
    topics: ['nextjs', 'social-preview', 'developer-tools', 'typescript'],
    license: 'MIT',
    latestRelease: { tag: 'v1.0.0', publishedAt: '2026-11-01T12:00:00Z' },
    contributors: [
      { login: 'sandovaldavid', avatarUrl: 'https://avatars.githubusercontent.com/u/102970701' },
    ],
  },
  'tailwindlabs/tailwindcss': {
    owner: {
      login: 'tailwindlabs',
      avatarUrl: 'https://avatars.githubusercontent.com/u/67104403',
      isOrg: true,
    },
    name: 'tailwindcss',
    description: 'A utility-first CSS framework for rapid UI development.',
    homepageUrl: 'https://tailwindcss.com',
    stars: 86500,
    forks: 4300,
    primaryLanguage: { name: 'Rust', color: '#DEA584' },
    languages: [
      { name: 'Rust', color: '#DEA584', size: 65000 },
      { name: 'TypeScript', color: '#3178C6', size: 35000 },
    ],
    topics: ['css', 'tailwindcss', 'compiler', 'responsive-design'],
    license: 'MIT',
    latestRelease: { tag: 'v4.0.0', publishedAt: '2026-01-22T16:00:00Z' },
    contributors: [
      { login: 'adamwathan', avatarUrl: 'https://avatars.githubusercontent.com/u/4323180' },
    ],
  },
  'facebook/react': {
    owner: {
      login: 'facebook',
      avatarUrl: 'https://avatars.githubusercontent.com/u/69631',
      isOrg: true,
    },
    name: 'react',
    description: 'The library for web and native user interfaces.',
    homepageUrl: 'https://react.dev',
    stars: 232000,
    forks: 46800,
    primaryLanguage: { name: 'JavaScript', color: '#F7DF1E' },
    languages: [
      { name: 'JavaScript', color: '#F7DF1E', size: 90000 },
      { name: 'TypeScript', color: '#3178C6', size: 10000 },
    ],
    topics: ['declarative', 'frontend', 'javascript', 'react', 'ui'],
    license: 'MIT',
    latestRelease: { tag: 'v19.0.0', publishedAt: '2025-12-05T12:00:00Z' },
    contributors: [
      { login: 'gaearon', avatarUrl: 'https://avatars.githubusercontent.com/u/810438' },
    ],
  },
  'shadcn-ui/ui': {
    owner: {
      login: 'shadcn-ui',
      avatarUrl: 'https://avatars.githubusercontent.com/u/139895814',
      isOrg: true,
    },
    name: 'ui',
    description: 'A set of beautifully-designed, accessible components and templates.',
    homepageUrl: 'https://ui.shadcn.com',
    stars: 82000,
    forks: 7200,
    primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
    languages: [{ name: 'TypeScript', color: '#3178C6', size: 100000 }],
    topics: ['components', 'radix-ui', 'react', 'tailwind'],
    license: 'MIT',
    latestRelease: { tag: 'v2.0.0', publishedAt: '2026-02-15T10:00:00Z' },
    contributors: [
      { login: 'shadcn', avatarUrl: 'https://avatars.githubusercontent.com/u/124599' },
    ],
  },
};

export class GitHubService {
  private octokit: Octokit;
  private authToken: string | undefined;

  /**
   * Resets process cache and circuit breakers (primarily used for unit testing).
   */
  static clearCache(): void {
    repoCache.clear();
    userReposCache.clear();
    graphQlDisabledUntil = 0;
  }

  constructor(token?: string) {
    this.authToken = token || process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({
      auth: this.authToken || undefined,
      request: {
        timeout: 3500, // Fast 3.5s timeout prevents long hangs
      },
      log: {
        debug: () => {},
        info: () => {},
        warn: () => {}, // Suppress noisy Octokit rate-limit stdout/stderr spam
        error: () => {},
      },
      throttle: {
        // Never hang for 12+ seconds waiting for GitHub rate limit reset; fail fast to REST fallback
        onRateLimit: () => false,
        onSecondaryRateLimit: () => false,
      },
    });
  }

  /**
   * Fallback using GitHub REST API v3 when GraphQL is unavailable, unauthenticated,
   * or rate-limited. Works with public repositories without mandatory auth tokens.
   */
  async fetchFromRestApi(owner: string, repo: string): Promise<RepoMetadata> {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const baseHeaders: Record<string, string> = {
      'User-Agent': 'GitCardX-Preview',
      Accept: 'application/vnd.github.v3+json',
    };

    let res: Response | null = null;

    // 1. First attempt with auth token if provided
    if (this.authToken) {
      try {
        res = await fetch(url, {
          headers: {
            ...baseHeaders,
            Authorization: `token ${this.authToken}`,
          },
        });
      } catch {
        res = null;
      }
    }

    // 2. If token returned 401 (bad token), 403 (quota exhausted), or 429 (rate limit):
    // Fall back to unauthenticated public request (GitHub allows 60 req/hr per IP for public repos)
    if (!res || !res.ok) {
      const isTokenIssue = !res || res.status === 401 || res.status === 403 || res.status === 429;
      if (this.authToken && isTokenIssue) {
        try {
          const unauthRes = await fetch(url, { headers: baseHeaders });
          if (unauthRes.ok || unauthRes.status === 404) {
            res = unauthRes;
          }
        } catch {
          // Keep previous response
        }
      } else if (!this.authToken && !res) {
        res = await fetch(url, { headers: baseHeaders });
      }
    }

    if (!res || !res.ok) {
      if (res?.status === 404) {
        throw new Error(`Repository '${owner}/${repo}' was not found or is private.`);
      }
      if (res?.status === 401 || res?.status === 403 || res?.status === 429) {
        const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
        const fallback = KNOWN_REPO_FALLBACKS[cacheKey];
        if (fallback) {
          return fallback;
        }
        throw new Error('GitHub API rate limit exceeded. Please try again shortly.');
      }
      throw new Error(`GitHub REST API returned status ${res?.status ?? 'network_error'}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (await res.json()) as any;
    const langName: string | null = raw.language || null;
    const langColor = langName ? getLanguageColor(langName) : null;

    // Concurrently enrich repository with real release, multi-language breakdown, and contributors
    let latestRelease: { tag: string; publishedAt: string } | null = null;
    let languagesList: Array<{ name: string; color: string; size: number }> = langName
      ? [{ name: langName, color: langColor || '#3178C6', size: raw.size || 1000 }]
      : [];
    let contributorsList: Array<{ login: string; avatarUrl: string }> = [
      {
        login: raw.owner.login,
        avatarUrl: raw.owner.avatar_url,
      },
    ];

    try {
      const authHeaders = this.authToken
        ? { ...baseHeaders, Authorization: `token ${this.authToken}` }
        : baseHeaders;

      const [releaseRes, langsRes, contribsRes] = await Promise.allSettled([
        fetch(
          `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`,
          { headers: authHeaders }
        ),
        fetch(
          `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
          { headers: authHeaders }
        ),
        fetch(
          `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=5`,
          { headers: authHeaders }
        ),
      ]);

      // 1. Process latest release (with tag fallback if no formal release published)
      if (releaseRes.status === 'fulfilled' && releaseRes.value.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const relData = (await releaseRes.value.json()) as any;
        if (relData && relData.tag_name) {
          latestRelease = {
            tag: relData.tag_name,
            publishedAt: relData.published_at || new Date().toISOString(),
          };
        }
      } else if (releaseRes.status === 'fulfilled' && releaseRes.value.status === 404) {
        try {
          const tagsRes = await fetch(
            `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tags?per_page=1`,
            { headers: authHeaders }
          );
          if (tagsRes.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tagsData = (await tagsRes.json()) as any;
            if (Array.isArray(tagsData) && tagsData.length > 0 && tagsData[0]?.name) {
              latestRelease = {
                tag: tagsData[0].name,
                publishedAt: new Date().toISOString(),
              };
            }
          }
        } catch {
          // Tag fallback ignored
        }
      }

      // 2. Process multi-language breakdown
      if (langsRes.status === 'fulfilled' && langsRes.value.ok) {
        const langsMap = (await langsRes.value.json()) as Record<string, number>;
        if (langsMap && typeof langsMap === 'object') {
          const entries = Object.entries(langsMap).slice(0, 4);
          if (entries.length > 0) {
            languagesList = entries.map(([name, size]) => ({
              name,
              color: getLanguageColor(name),
              size,
            }));
          }
        }
      }

      // 3. Process top contributors
      if (contribsRes.status === 'fulfilled' && contribsRes.value.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contribsData = (await contribsRes.value.json()) as any[];
        if (Array.isArray(contribsData) && contribsData.length > 0) {
          contributorsList = contribsData.slice(0, 5).map((c) => ({
            login: c.login,
            avatarUrl: c.avatar_url,
          }));
        }
      }
    } catch {
      // Enrichment failed gracefully; fallback to basic metadata
    }

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
      languages: languagesList,
      topics: Array.isArray(raw.topics) ? raw.topics : [],
      license: raw.license?.spdx_id || raw.license?.name || null,
      latestRelease,
      contributors: contributorsList,
    };

    const parsed = RepoMetadataSchema.parse(metadata);
    // Cache successful repository in memory for 10 minutes
    repoCache.set(`${owner.toLowerCase()}/${repo.toLowerCase()}`, {
      data: parsed,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return parsed;
  }

  /**
   * Fallback using GitHub REST API v3 for user/org repository autocomplete.
   */
  private async fetchUserReposFromRestApi(login: string): Promise<RepoAutocompleteItem[]> {
    try {
      const baseHeaders: Record<string, string> = {
        'User-Agent': 'GitCardX-Preview',
        Accept: 'application/vnd.github.v3+json',
      };
      const headers: Record<string, string> = { ...baseHeaders };
      if (this.authToken) {
        headers.Authorization = `token ${this.authToken}`;
      }

      let res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(login)}/repos?sort=updated&per_page=15`,
        { headers }
      );

      // If token failed with 401/403/429, retry without token
      if (
        !res.ok &&
        (res.status === 401 || res.status === 403 || res.status === 429) &&
        this.authToken
      ) {
        res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(login)}/repos?sort=updated&per_page=15`,
          { headers: baseHeaders }
        );
      }

      if (!res.ok && res.status === 404) {
        res = await fetch(
          `https://api.github.com/orgs/${encodeURIComponent(login)}/repos?sort=updated&per_page=15`,
          { headers: this.authToken ? headers : baseHeaders }
        );
        if (
          !res.ok &&
          (res.status === 401 || res.status === 403 || res.status === 429) &&
          this.authToken
        ) {
          res = await fetch(
            `https://api.github.com/orgs/${encodeURIComponent(login)}/repos?sort=updated&per_page=15`,
            { headers: baseHeaders }
          );
        }
      }
      if (!res.ok) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await res.json()) as any;
      if (!Array.isArray(data)) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: RepoAutocompleteItem[] = data.map((item: any) => ({
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

      userReposCache.set(login.toLowerCase(), {
        data: items,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });

      return items;
    } catch {
      return [];
    }
  }

  /**
   * Fetches rich metadata for a given GitHub repository using GraphQL v4 with REST API v3 fallback,
   * in-memory caching and circuit breaker resilience against quota exhaustion.
   */
  async getRepository(owner: string, repo: string): Promise<RepoMetadata> {
    const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}`;

    // 1. Check in-memory process cache first
    const cached = repoCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // 2. Check circuit breaker: if no token or GraphQL quota was exhausted recently, go straight to REST
    const canUseGraphQl = Boolean(this.authToken) && Date.now() >= graphQlDisabledUntil;
    if (!canUseGraphQl) {
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

      const parsed = RepoMetadataSchema.parse(metadata);
      repoCache.set(cacheKey, {
        data: parsed,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return parsed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Could not resolve to a Repository') || message.includes('404')) {
        throw new Error(`Repository '${owner}/${repo}' was not found or is private.`);
      }

      // If GraphQL failed due to quota exhaustion, rate limit, or secondary rate limit:
      // Activate circuit breaker for 15 minutes to avoid hammering GraphQL and prevent log spam
      const isQuotaOrLimit =
        message.toLowerCase().includes('quota') ||
        message.toLowerCase().includes('rate limit') ||
        message.includes('403') ||
        message.includes('429');

      if (isQuotaOrLimit) {
        graphQlDisabledUntil = Date.now() + 15 * 60 * 1000;
      }

      // Fall back seamlessly to REST API v3
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
          const fallback = KNOWN_REPO_FALLBACKS[cacheKey];
          if (fallback) {
            return fallback;
          }
          throw new Error(`GitHub API rate limit exceeded. Please try again shortly.`);
        }
        throw restError;
      }
    }
  }

  /**
   * Fetches public repositories for a given user or organization for autocomplete with caching.
   */
  async getUserRepositories(login: string): Promise<RepoAutocompleteItem[]> {
    const cacheKey = login.toLowerCase();

    // 1. Check in-memory process cache first
    const cached = userReposCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    const canUseGraphQl = Boolean(this.authToken) && Date.now() >= graphQlDisabledUntil;
    if (!canUseGraphQl) {
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
        const items = nodes.map((n) => ({
          name: n.name,
          description: n.description,
          stars: n.stargazerCount,
          primaryLanguage: n.primaryLanguage,
          updatedAt: n.updatedAt,
        }));

        userReposCache.set(cacheKey, {
          data: items,
          expiresAt: Date.now() + 10 * 60 * 1000,
        });

        return items;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
        graphQlDisabledUntil = Date.now() + 15 * 60 * 1000;
      }
    }

    return await this.fetchUserReposFromRestApi(login);
  }
}
