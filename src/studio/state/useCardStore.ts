import { create } from 'zustand';
import type {
  RepoMetadata,
  CardConfig,
  TemplateId,
  Palette,
  BackgroundPatternConfig,
  CardVisibility,
  ContentAlign,
} from '@/core/domain/schemas';
import { PRESET_PALETTES, ThemeEngine } from '@/core/theme/ThemeEngine';
import { suggestInstallCommand } from '@/core/domain/stackMapper';

export const DEFAULT_REPO: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
    isOrg: false,
  },
  name: 'gitframe',
  description: 'Instant 5-second GitHub Social Preview card generator for developers.',
  homepageUrl: 'https://gitframe.dev',
  stars: 1250,
  forks: 180,
  primaryLanguage: {
    name: 'TypeScript',
    color: '#3178C6',
  },
  languages: [
    { name: 'TypeScript', color: '#3178C6', size: 85000 },
    { name: 'CSS', color: '#1572B6', size: 15000 },
  ],
  topics: ['nextjs', 'social-preview', 'developer-tools', 'typescript'],
  license: 'MIT',
  latestRelease: {
    tag: 'v1.0.0',
    publishedAt: '2026-11-01T12:00:00Z',
  },
  contributors: [
    { login: 'sandovaldavid', avatarUrl: 'https://avatars.githubusercontent.com/u/12345' },
  ],
};

export const DEFAULT_CONFIG: CardConfig = {
  templateId: 'linear-minimal',
  title: 'Gitframe',
  tagline: 'Give your GitHub repository a memorable visual identity.',
  installCommand: 'bun add gitframe',
  contentAlign: 'left',
  palette: PRESET_PALETTES['slate-minimal'],
  typography: {
    fontHeading: 'Inter',
    fontMono: 'JetBrains Mono',
  },
  backgroundPattern: {
    id: 'architectural-grid',
    opacity: 0.4,
  },
  visibility: {
    stars: true,
    forks: true,
    release: true,
    license: true,
    contributors: true,
    techStack: true,
    languageLogos: true,
    author: true,
    tagline: true,
    installCommand: true,
  },
};

export const TEMPLATE_SIGNATURE_PATTERNS: Partial<
  Record<TemplateId, BackgroundPatternConfig['id']>
> = {
  'aurora-mesh': 'aurora-mesh',
  'blueprint-grid': 'architectural-grid',
  'release-spotlight': 'radial-spotlight',
};

interface CardStoreState {
  repo: RepoMetadata;
  config: CardConfig;
  past: CardConfig[];
  future: CardConfig[];
  zoom: number;
  showSafeZoneGuides: boolean;
  isFetchingRepo: boolean;
  fetchError: string | null;
  activeRightTab: 'templates' | 'theme' | 'background' | 'typography' | 'vault';
  isExportModalOpen: boolean;
  viewMode: 'canvas' | 'social';

  // Actions
  setRepo: (repo: RepoMetadata, autoTheme?: boolean) => void;
  updateConfig: (partial: Partial<CardConfig>) => void;
  setTemplateId: (templateId: TemplateId) => void;
  setContentAlign: (align: ContentAlign) => void;
  setPalette: (palette: Palette) => void;
  setBackgroundPattern: (pattern: Partial<BackgroundPatternConfig>) => void;
  toggleVisibility: (key: keyof CardVisibility) => void;
  setZoom: (zoom: number) => void;
  toggleSafeZoneGuides: () => void;
  setActiveRightTab: (tab: 'templates' | 'theme' | 'background' | 'typography' | 'vault') => void;
  setViewMode: (mode: 'canvas' | 'social') => void;
  setIsExportModalOpen: (open: boolean) => void;
  setIsFetchingRepo: (fetching: boolean) => void;
  setFetchError: (error: string | null) => void;

  // History Actions
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  resetConfig: () => void;
}

const MAX_HISTORY = 30;

export const useCardStore = create<CardStoreState>((set, get) => ({
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
  viewMode: 'canvas',

  setRepo: (repo, autoTheme = true) => {
    const currentConfig = get().config;
    let newPalette = currentConfig.palette;

    if (autoTheme && repo.primaryLanguage?.color) {
      newPalette = ThemeEngine.generatePaletteFromLanguageColor(repo.primaryLanguage.color, 'dark');
    }

    const suggestedCmd = suggestInstallCommand(
      repo.languages,
      repo.topics,
      repo.name,
      repo.owner.login
    );

    const nextConfig: CardConfig = {
      ...currentConfig,
      title: repo.name,
      tagline: repo.description || 'Modern developer tool and open source project.',
      installCommand: suggestedCmd,
      palette: newPalette,
    };

    set((state) => ({
      repo,
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.config],
      future: [],
      config: nextConfig,
      fetchError: null,
    }));
  },

  updateConfig: (partial) => {
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.config],
      future: [],
      config: {
        ...state.config,
        ...partial,
      },
    }));
  },

  setTemplateId: (templateId) => {
    const signaturePattern = TEMPLATE_SIGNATURE_PATTERNS[templateId];
    if (signaturePattern) {
      get().updateConfig({
        templateId,
        backgroundPattern: {
          ...get().config.backgroundPattern,
          id: signaturePattern,
        },
      });
    } else {
      get().updateConfig({ templateId });
    }
  },

  setContentAlign: (contentAlign) => {
    get().updateConfig({ contentAlign });
  },

  setPalette: (palette) => {
    get().updateConfig({ palette });
  },

  setBackgroundPattern: (pattern) => {
    const current = get().config.backgroundPattern;
    get().updateConfig({
      backgroundPattern: {
        ...current,
        ...pattern,
      },
    });
  },

  toggleVisibility: (key) => {
    const current = get().config.visibility;
    get().updateConfig({
      visibility: {
        ...current,
        [key]: !current[key],
      },
    });
  },

  setZoom: (zoom) => {
    const clamped = Math.min(Math.max(zoom, 0.4), 1.6);
    set({ zoom: Number(clamped.toFixed(2)) });
  },

  toggleSafeZoneGuides: () => {
    set((state) => ({ showSafeZoneGuides: !state.showSafeZoneGuides }));
  },

  setActiveRightTab: (activeRightTab) => {
    set({ activeRightTab });
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  setIsExportModalOpen: (isExportModalOpen) => {
    set({ isExportModalOpen });
  },

  setIsFetchingRepo: (isFetchingRepo) => {
    set({ isFetchingRepo });
  },

  setFetchError: (fetchError) => {
    set({ fetchError });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: () => {
    const { past, future, config } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      future: [config, ...future],
      config: previous,
    });
  },

  redo: () => {
    const { past, future, config } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, config],
      future: newFuture,
      config: next,
    });
  },

  resetConfig: () => {
    set((state) => ({
      past: [...state.past, state.config],
      future: [],
      config: DEFAULT_CONFIG,
    }));
  },
}));
