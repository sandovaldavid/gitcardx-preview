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

export class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    const authToken = token || process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({
      auth: authToken || undefined,
    });
  }

  /**
   * Fetches rich metadata for a given GitHub repository using GraphQL v4.
   */
  async getRepository(owner: string, repo: string): Promise<RepoMetadata> {
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
        throw new Error(`Repository ${owner}/${repo} not found on GitHub.`);
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
      if (message.includes('rate limit') || message.includes('403')) {
        throw new Error(`GitHub API rate limit exceeded. Please try again shortly.`);
      }
      throw error;
    }
  }

  /**
   * Fetches public repositories for a given user or organization for autocomplete.
   */
  async getUserRepositories(login: string): Promise<RepoAutocompleteItem[]> {
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

      return nodes.map((n) => ({
        name: n.name,
        description: n.description,
        stars: n.stargazerCount,
        primaryLanguage: n.primaryLanguage,
        updatedAt: n.updatedAt,
      }));
    } catch {
      return [];
    }
  }
}
