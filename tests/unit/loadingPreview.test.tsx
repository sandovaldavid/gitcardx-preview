import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CardLoadingPreview } from '@/studio/components/CardLoadingPreview';
import { StudioLoadingView } from '@/studio/components/StudioLoadingView';
import { useCardStore } from '@/studio/state/useCardStore';

describe('CardLoadingPreview & StudioLoadingView', () => {
  it('renders CardLoadingPreview with exact 1280x640 bounds and scale factor', () => {
    const html = renderToString(<CardLoadingPreview scale={0.5} />);

    expect(html).toContain('data-testid="card-loading-preview"');
    expect(html).toContain('width:640px'); // 1280 * 0.5
    expect(html).toContain('height:320px'); // 640 * 0.5
    expect(html).toContain('transform:scale(0.5)');
    expect(html).toContain('shimmer-sweep');
  });

  it('renders repository name prominently inside CardLoadingPreview and HUD', () => {
    const repoTarget = 'sandovaldavid/portfolio';
    const html = renderToString(<CardLoadingPreview repoName={repoTarget} />);

    expect(html).toContain(repoTarget);
    expect(html).toContain('Extracting Repository');
    expect(html).toContain('Connecting to GitHub API v4');
    expect(html).toContain('Extracting stats &amp; tech stack');
    expect(html).toContain('Synthesizing card preview');
  });

  it('hides extraction HUD when showHud is set to false', () => {
    const html = renderToString(<CardLoadingPreview showHud={false} />);

    expect(html).not.toContain('Extracting Repository');
    expect(html).not.toContain('Connecting to GitHub API v4');
  });

  it('renders StudioLoadingView with header, panels, and loading card preview', () => {
    const html = renderToString(<StudioLoadingView repoName="facebook/react" />);

    expect(html).toContain('data-testid="studio-loading-view"');
    expect(html).toContain('facebook/react');
    expect(html).toContain('Gitframe');
    expect(html).toContain('data-testid="card-loading-preview"');
  });

  it('useCardStore records and clears fetchingRepoName accurately', () => {
    const { setIsFetchingRepo, setRepo } = useCardStore.getState();

    // 1. Start fetching with repo name
    setIsFetchingRepo(true, 'astral-sh/uv');
    expect(useCardStore.getState().isFetchingRepo).toBe(true);
    expect(useCardStore.getState().fetchingRepoName).toBe('astral-sh/uv');

    // 2. Clear fetching manually
    setIsFetchingRepo(false);
    expect(useCardStore.getState().isFetchingRepo).toBe(false);
    expect(useCardStore.getState().fetchingRepoName).toBeNull();

    // 3. Setting a repo automatically resets fetchingRepoName
    setIsFetchingRepo(true, 'vercel/next.js');
    setRepo({
      owner: {
        login: 'vercel',
        avatarUrl: 'https://avatars.githubusercontent.com/u/14985020',
        isOrg: true,
      },
      name: 'next.js',
      description: 'The React Framework for the Web',
      homepageUrl: 'https://nextjs.org',
      stars: 120000,
      forks: 26000,
      primaryLanguage: { name: 'JavaScript', color: '#f1e05a' },
      languages: [],
      topics: [],
      license: 'MIT',
      latestRelease: null,
      contributors: [],
    });
    expect(useCardStore.getState().fetchingRepoName).toBeNull();
  });
});
