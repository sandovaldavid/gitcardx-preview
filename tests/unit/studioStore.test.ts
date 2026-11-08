import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore, DEFAULT_REPO, DEFAULT_CONFIG } from '@/studio/state/useCardStore';

describe('useCardStore (Zustand state & history)', () => {
  beforeEach(() => {
    useCardStore.setState({
      repo: DEFAULT_REPO,
      config: DEFAULT_CONFIG,
      past: [],
      future: [],
      zoom: 1,
      showSafeZoneGuides: false,
      isFetchingRepo: false,
      fetchError: null,
      activeRightTab: 'templates',
      isExportModalOpen: false,
    });
  });

  it('initializes with default repo and configuration', () => {
    const state = useCardStore.getState();
    expect(state.repo.name).toBe('gitframe');
    expect(state.config.templateId).toBe('linear-minimal');
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
    setTemplateId('cli-terminal');
    expect(useCardStore.getState().config.templateId).toBe('cli-terminal');

    setTemplateId('aurora-mesh');
    expect(useCardStore.getState().config.templateId).toBe('aurora-mesh');
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
});
