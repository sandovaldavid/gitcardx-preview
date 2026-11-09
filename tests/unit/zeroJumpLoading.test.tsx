import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StudioLayout } from '@/studio/components/StudioLayout';
import { InteractiveCanvas } from '@/studio/components/InteractiveCanvas';
import {
  useCardStore,
  deriveConfigForRepo,
  DEFAULT_REPO,
  DEFAULT_CONFIG,
} from '@/studio/state/useCardStore';
import type { RepoMetadata } from '@/core/domain/schemas';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const PORTFOLIO_REPO: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl: 'https://avatars.githubusercontent.com/u/102970701',
    isOrg: false,
  },
  name: 'portfolio',
  description: "Portfolio's David",
  homepageUrl: 'https://sandovaldavid.com',
  stars: 12,
  forks: 2,
  primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
  languages: [{ name: 'TypeScript', color: '#3178C6', size: 372000 }],
  topics: ['portfolio', 'nextjs'],
  license: 'MIT',
  latestRelease: { tag: 'v2.0.1', publishedAt: '2026-11-05T13:00:09Z' },
  contributors: [],
};

describe('Zero-jump repository loading & hydration flow', () => {
  beforeEach(() => {
    useCardStore.setState({
      repo: DEFAULT_REPO,
      config: DEFAULT_CONFIG,
      hasCustomRepo: false,
      hydratedRouteKey: null,
      past: [],
      future: [],
      zoom: 1,
      showSafeZoneGuides: false,
      isFetchingRepo: false,
      fetchingRepoName: null,
      fetchError: null,
      activeRightTab: 'templates',
      isExportModalOpen: false,
      viewMode: 'canvas',
    });
  });

  it('hydrates initialRepo synchronously on first SSR render without flashing DEFAULT_REPO', () => {
    const html = renderToString(<StudioLayout initialRepo={PORTFOLIO_REPO} />);

    expect(html).toContain('portfolio');
    expect(html).toContain('Portfolio&#x27;s David');
    expect(html).not.toContain(DEFAULT_CONFIG.tagline);
    expect(html).toContain('data-testid="studio-card-stage"');
  });

  it('suppresses DEFAULT_REPO flash during cold SSR stream while preserving real Studio chrome', () => {
    const html = renderToString(<StudioLayout isPendingInitialRepo />);

    // Real Studio header, view switcher, and controls are rendered immediately
    expect(html).toContain('Card Studio');
    expect(html).toContain('Social Simulator');
    expect(html).toContain('Export Card');

    // Neither DEFAULT_REPO card nor fake skeleton card is painted during cold stream
    expect(html).not.toContain('data-testid="studio-card-stage"');
    expect(html).not.toContain('data-testid="card-loading-preview"');
  });

  it('hydrates HeroGenerator repo & selected template cleanly without polluting Undo history', () => {
    useCardStore.getState().hydrateRepo(PORTFOLIO_REPO, {
      autoTheme: true,
      templateId: 'aurora-glass',
    });

    const state = useCardStore.getState();
    expect(state.hasCustomRepo).toBe(true);
    expect(state.hydratedRouteKey).toBe('sandovaldavid/portfolio');
    expect(state.repo.name).toBe('portfolio');
    expect(state.config.title).toBe('portfolio');
    expect(state.config.tagline).toBe("Portfolio's David");
    expect(state.config.templateId).toBe('aurora-glass');
    expect(state.config.backgroundPattern.id).toBe('aurora-mesh');
    expect(state.canUndo()).toBe(false);

    const derived = deriveConfigForRepo(PORTFOLIO_REPO, DEFAULT_CONFIG, {
      autoTheme: true,
      templateId: 'blueprint-grid',
    });
    expect(derived.templateId).toBe('blueprint-grid');
    expect(derived.backgroundPattern.id).toBe('architectural-grid');
  });

  it('keeps the Studio card stage mounted without skeleton overlays during Omnibar fetches', () => {
    useCardStore.getState().setIsFetchingRepo(true, 'facebook/react');

    expect(useCardStore.getState().isFetchingRepo).toBe(true);
    expect(useCardStore.getState().fetchingRepoName).toBe('facebook/react');

    const html = renderToString(<InteractiveCanvas />);
    expect(html).toContain('data-testid="studio-card-stage"');
    expect(html).not.toContain('data-testid="card-loading-preview"');

    // Completing setRepo clears fetching flags automatically and records history
    useCardStore.getState().setRepo({
      ...PORTFOLIO_REPO,
      owner: {
        login: 'facebook',
        avatarUrl: 'https://avatars.githubusercontent.com/u/69631',
        isOrg: true,
      },
      name: 'react',
      description: 'The library for web and native user interfaces.',
    });

    expect(useCardStore.getState().isFetchingRepo).toBe(false);
    expect(useCardStore.getState().fetchingRepoName).toBeNull();
    expect(useCardStore.getState().canUndo()).toBe(true);
  });
});
