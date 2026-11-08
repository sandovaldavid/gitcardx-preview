export type GitHubInputResult =
  | {
      type: 'repo';
      owner: string;
      repo: string;
      original: string;
    }
  | {
      type: 'owner';
      owner: string;
      original: string;
    }
  | {
      type: 'invalid';
      error: string;
      original: string;
    };

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const GITHUB_REPO_REGEX = /^[a-zA-Z0-9_.-]+$/;

export function parseGitHubInput(rawInput: string): GitHubInputResult {
  const original = rawInput;
  const input = rawInput.trim();

  if (!input) {
    return {
      type: 'invalid',
      error: 'Input cannot be empty',
      original,
    };
  }

  // Handle URL formats
  if (
    input.startsWith('http://') ||
    input.startsWith('https://') ||
    input.startsWith('github.com/')
  ) {
    try {
      const urlString = input.startsWith('http') ? input : `https://${input}`;
      const url = new URL(urlString);

      if (!url.hostname.includes('github.com')) {
        return {
          type: 'invalid',
          error: 'Only github.com URLs are supported',
          original,
        };
      }

      // Split path and filter empty segments
      const segments = url.pathname.split('/').filter(Boolean);

      if (segments.length === 0) {
        return {
          type: 'invalid',
          error: 'Missing owner and repository in URL',
          original,
        };
      }

      if (segments.length === 1) {
        const owner = segments[0];
        if (GITHUB_USERNAME_REGEX.test(owner)) {
          return {
            type: 'owner',
            owner,
            original,
          };
        }
      }

      if (segments.length >= 2) {
        const owner = segments[0];
        let repo = segments[1];

        // Strip .git suffix if present
        if (repo.endsWith('.git')) {
          repo = repo.slice(0, -4);
        }

        if (GITHUB_USERNAME_REGEX.test(owner) && GITHUB_REPO_REGEX.test(repo)) {
          return {
            type: 'repo',
            owner,
            repo,
            original,
          };
        }
      }

      return {
        type: 'invalid',
        error: 'Invalid GitHub URL format',
        original,
      };
    } catch {
      return {
        type: 'invalid',
        error: 'Could not parse URL',
        original,
      };
    }
  }

  // Handle @username notation
  if (input.startsWith('@')) {
    const owner = input.slice(1);
    if (GITHUB_USERNAME_REGEX.test(owner)) {
      return {
        type: 'owner',
        owner,
        original,
      };
    }
    return {
      type: 'invalid',
      error: 'Invalid GitHub username after @',
      original,
    };
  }

  // Handle owner/repo notation
  if (input.includes('/')) {
    const parts = input.split('/');
    if (parts.length === 2) {
      const [owner, rawRepo] = parts;
      const repo = rawRepo.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo;

      if (GITHUB_USERNAME_REGEX.test(owner) && GITHUB_REPO_REGEX.test(repo)) {
        return {
          type: 'repo',
          owner,
          repo,
          original,
        };
      }
    }

    return {
      type: 'invalid',
      error: 'Invalid owner/repo format',
      original,
    };
  }

  // Single word: treated as owner / user handle
  if (GITHUB_USERNAME_REGEX.test(input)) {
    return {
      type: 'owner',
      owner: input,
      original,
    };
  }

  return {
    type: 'invalid',
    error: 'Unrecognized GitHub repository or username format',
    original,
  };
}
