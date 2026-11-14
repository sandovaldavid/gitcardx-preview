import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore, DEFAULT_REPO, DEFAULT_CONFIG } from '@/studio/state/useCardStore';

describe('useCardStore (Zustand state & history)', () => {
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
    });
  });

  it('initializes with default repo and configuration', () => {
    const state = useCardStore.getState();
    expect(state.repo.name).toBe('gitframe');
    expect(state.config.templateId).toBe('modern-minimal');
    expect(state.zoom).toBe(1);
    expect(state.canUndo()).toBe(false);
    expect(state.canRedo()).toBe(false);
  });

  it('updates configuration and manages undo/redo stack', () => {
    const { updateConfig, undo, redo, canUndo, canRedo } = useCardStore.getState();

    updateConfig({ title: 'New Custom Title' });
    expect(useCardStore.getState().config.title).toBe('New Custom Title');
    expect(canUndo()).toBe(true);
    expect(canRedo()).toBe(false);

    undo();
    expect(useCardStore.getState().config.title).toBe(DEFAULT_CONFIG.title);
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(true);

    redo();
    expect(useCardStore.getState().config.title).toBe('New Custom Title');
  });

  it('switches template correctly and assigns signature background pattern when present', () => {
    const { setTemplateId, setBackgroundPattern } = useCardStore.getState();
    setTemplateId('terminal-prompt');
    expect(useCardStore.getState().config.templateId).toBe('terminal-prompt');

    setTemplateId('aurora-glass');
    expect(useCardStore.getState().config.templateId).toBe('aurora-glass');
    expect(useCardStore.getState().config.backgroundPattern.id).toBe('aurora-mesh');

    // User can customize pattern afterwards
    setBackgroundPattern({ id: 'dot-matrix' });
    expect(useCardStore.getState().config.backgroundPattern.id).toBe('dot-matrix');
  });

  it('toggles visibility flags including author, tagline, and installCommand', () => {
    const { toggleVisibility } = useCardStore.getState();
    const initialAuthor = useCardStore.getState().config.visibility.author;
    const initialTagline = useCardStore.getState().config.visibility.tagline;
    const initialInstall = useCardStore.getState().config.visibility.installCommand;

    toggleVisibility('author');
    toggleVisibility('tagline');
    toggleVisibility('installCommand');

    expect(useCardStore.getState().config.visibility.author).toBe(!initialAuthor);
    expect(useCardStore.getState().config.visibility.tagline).toBe(!initialTagline);
    expect(useCardStore.getState().config.visibility.installCommand).toBe(!initialInstall);
  });

  it('updates content alignment with setContentAlign', () => {
    const { setContentAlign, undo } = useCardStore.getState();
    expect(useCardStore.getState().config.contentAlign).toBe('left');

    setContentAlign('center');
    expect(useCardStore.getState().config.contentAlign).toBe('center');

    undo();
    expect(useCardStore.getState().config.contentAlign).toBe('left');
  });

  it('clamps zoom between 0.4 and 1.6', () => {
    const { setZoom } = useCardStore.getState();

    setZoom(2.5);
    expect(useCardStore.getState().zoom).toBe(1.6);

    setZoom(0.1);
    expect(useCardStore.getState().zoom).toBe(0.4);

    setZoom(0.85);
    expect(useCardStore.getState().zoom).toBe(0.85);
  });

  it('setRepo updates repo and auto-generates matching language palette', () => {
    const { setRepo } = useCardStore.getState();

    setRepo(
      {
        ...DEFAULT_REPO,
        name: 'rust-engine',
        description: 'Blazing fast Rust microservice',
        primaryLanguage: {
          name: 'Rust',
          color: '#DEA584',
        },
        languages: [{ name: 'Rust', color: '#DEA584', size: 50000 }],
        topics: ['rust', 'cli'],
      },
      true
    );

    const state = useCardStore.getState();
    expect(state.repo.name).toBe('rust-engine');
    expect(state.config.title).toBe('rust-engine');
    expect(state.config.tagline).toBe('Blazing fast Rust microservice');
    expect(state.config.installCommand).toBe('cargo add rust-engine');
  });

  it('matches live gitframe telemetry on DEFAULT_REPO without stale license or missing release', () => {
    expect(DEFAULT_REPO.license).toBeNull();
    expect(DEFAULT_REPO.latestRelease?.tag).toBe('v0.1.1');
    expect(DEFAULT_REPO.contributorsCount).toBe(2);
    expect(DEFAULT_REPO.topics).toEqual([]);
  });

  it('syncDefaultRepoMetadata updates default repo silently without overwriting config or custom repo', () => {
    const store = useCardStore.getState();
    store.updateConfig({ tagline: 'Custom studio tagline' });

    store.syncDefaultRepoMetadata({
      ...DEFAULT_REPO,
      stars: 42,
      forks: 7,
      latestRelease: { tag: 'v0.2.0', publishedAt: '2026-11-14T00:00:00Z' },
    });

    const state = useCardStore.getState();
    expect(state.repo.stars).toBe(42);
    expect(state.repo.forks).toBe(7);
    expect(state.repo.latestRelease?.tag).toBe('v0.2.0');
    expect(state.config.title).toBe('Gitframe');
    expect(state.config.tagline).toBe('Custom studio tagline');
    expect(state.hasCustomRepo).toBe(false);
    expect(state.past).toHaveLength(1);

    // Once user loads a custom repo, background default sync cannot clobber it
    state.setRepo({ ...DEFAULT_REPO, name: 'other-repo' }, true);
    state.syncDefaultRepoMetadata({ ...DEFAULT_REPO, stars: 999 });
    expect(useCardStore.getState().repo.name).toBe('other-repo');
    expect(useCardStore.getState().repo.stars).toBe(0);
  });

  it('sanitizes customLogoUrl and customBackgroundUrl inside updateConfig', () => {
    const store = useCardStore.getState();

    store.updateConfig({
      customLogoUrl: 'javascript:alert(1)',
      customBackgroundUrl: 'https://evil.example/bg.png");background:red',
    });
    expect(useCardStore.getState().config.customLogoUrl).toBeUndefined();
    expect(useCardStore.getState().config.customBackgroundUrl).toBeUndefined();

    store.updateConfig({
      customLogoUrl: 'https://example.com/logo.png',
      customBackgroundUrl: `data:image/png;base64,${'A'.repeat(250_000)}`,
    });
    expect(useCardStore.getState().config.customLogoUrl).toBe('https://example.com/logo.png');
    expect(useCardStore.getState().config.customBackgroundUrl).toHaveLength(22 + 250_000);
  });
});
