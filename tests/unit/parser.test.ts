import { describe, it, expect } from 'vitest';
import { parseGitHubInput } from '@/core/domain/parser';

describe('parseGitHubInput', () => {
  it('returns invalid for empty or whitespace-only input', () => {
    expect(parseGitHubInput('').type).toBe('invalid');
    expect(parseGitHubInput('   ').type).toBe('invalid');
  });

  it('parses full https GitHub repository URLs', () => {
    const res = parseGitHubInput('https://github.com/sandovaldavid/gitframe');
    expect(res).toEqual({
      type: 'repo',
      owner: 'sandovaldavid',
      repo: 'gitframe',
      original: 'https://github.com/sandovaldavid/gitframe',
    });
  });

  it('strips .git extension from repository URLs', () => {
    const res = parseGitHubInput('https://github.com/vercel/next.js.git');
    expect(res).toEqual({
      type: 'repo',
      owner: 'vercel',
      repo: 'next.js',
      original: 'https://github.com/vercel/next.js.git',
    });
  });

  it('handles github.com without protocol', () => {
    const res = parseGitHubInput('github.com/facebook/react');
    expect(res).toEqual({
      type: 'repo',
      owner: 'facebook',
      repo: 'react',
      original: 'github.com/facebook/react',
    });
  });

  it('handles repository URLs with subpaths (e.g. tree/main)', () => {
    const res = parseGitHubInput('https://github.com/tailwindlabs/tailwindcss/tree/main/packages');
    expect(res).toEqual({
      type: 'repo',
      owner: 'tailwindlabs',
      repo: 'tailwindcss',
      original: 'https://github.com/tailwindlabs/tailwindcss/tree/main/packages',
    });
  });

  it('parses GitHub profile URLs as owner', () => {
    const res = parseGitHubInput('https://github.com/sandovaldavid');
    expect(res).toEqual({
      type: 'owner',
      owner: 'sandovaldavid',
      original: 'https://github.com/sandovaldavid',
    });
  });

  it('parses @username notation as owner', () => {
    const res = parseGitHubInput('@shadcn');
    expect(res).toEqual({
      type: 'owner',
      owner: 'shadcn',
      original: '@shadcn',
    });
  });

  it('parses standard owner/repo shorthand', () => {
    const res = parseGitHubInput('colord/colord');
    expect(res).toEqual({
      type: 'repo',
      owner: 'colord',
      repo: 'colord',
      original: 'colord/colord',
    });
  });

  it('strips .git in owner/repo shorthand', () => {
    const res = parseGitHubInput('colord/colord.git');
    expect(res).toEqual({
      type: 'repo',
      owner: 'colord',
      repo: 'colord',
      original: 'colord/colord.git',
    });
  });

  it('treats single valid username string as owner', () => {
    const res = parseGitHubInput('torvalds');
    expect(res).toEqual({
      type: 'owner',
      owner: 'torvalds',
      original: 'torvalds',
    });
  });

  it('rejects non-github URLs', () => {
    const res = parseGitHubInput('https://gitlab.com/some/repo');
    expect(res.type).toBe('invalid');
    if (res.type === 'invalid') {
      expect(res.error).toContain('Only github.com');
    }
  });

  it('rejects invalid inputs with special forbidden characters', () => {
    const res = parseGitHubInput('invalid$name/repo!');
    expect(res.type).toBe('invalid');
  });
});
