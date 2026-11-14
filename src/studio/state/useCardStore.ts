import { createContext, useContext } from 'react';
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
import { normalizeTemplateId } from '@/core/domain/schemas';
import { PRESET_PALETTES, ThemeEngine } from '@/core/theme/ThemeEngine';
import { suggestInstallCommand } from '@/core/domain/stackMapper';
import { sanitizeClientImageUrl } from '@/core/security/ssrf';
import { TEMPLATE_SIGNATURE_PATTERNS } from '@/cards/templates/templateCapabilities';

export { TEMPLATE_SIGNATURE_PATTERNS };

export const DEFAULT_REPO: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl: 'https://avatars.githubusercontent.com/u/102970701',
    isOrg: false,
  },
  name: 'gitframe',
  description: 'Instant 5-second GitHub Social Preview card generator for developers.',
  homepageUrl: 'https://gitframe.dev',
  stars: 0,
  forks: 0,
  primaryLanguage: {
    name: 'TypeScript',
    color: '#3178C6',
  },
  languages: [
    { name: 'TypeScript', color: '#3178C6', size: 929409 },
    { name: 'JavaScript', color: '#F7DF1E', size: 10672 },
    { name: 'CSS', color: '#1572B6', size: 4731 },
  ],
  topics: [],
  license: null,
  latestRelease: {
    tag: 'v0.1.1',
    publishedAt: '2026-11-13T15:34:29Z',
  },
  contributors: [
    { login: 'sandovaldavid', avatarUrl: 'https://avatars.githubusercontent.com/u/102970701' },
    {
      login: 'github-actions[bot]',
      avatarUrl: 'https://avatars.githubusercontent.com/in/15368?v=4',
    },
  ],
  contributorsCount: 2,
  openIssuesCount: 0,
  discussionsCount: undefined,
};

export const DEFAULT_CONFIG: CardConfig = {
  templateId: 'modern-minimal',
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
    issues: false,
    discussions: false,
  },
};

export interface HydrateRepoOptions {
  autoTheme?: boolean;
  templateId?: TemplateId;
}

function clampGraphemeLength(value: string, maxCodeUnits: number): string {
  if (value.length <= maxCodeUnits) {
    return value;
  }

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    let result = '';
    for (const { segment } of segmenter.segment(value)) {
      if (result.length + segment.length > maxCodeUnits) {
        break;
      }
      result += segment;
    }
    return result;
  }

  return Array.from(value).slice(0, maxCodeUnits).join('').slice(0, maxCodeUnits);
}

export function deriveConfigForRepo(
  repo: RepoMetadata,
  baseConfig: CardConfig,
  options?: HydrateRepoOptions
): CardConfig {
  const autoTheme = options?.autoTheme ?? true;
  const templateId = options?.templateId
    ? normalizeTemplateId(options.templateId)
    : baseConfig.templateId;
  const signaturePattern = options?.templateId
    ? TEMPLATE_SIGNATURE_PATTERNS[templateId]
    : undefined;

  let newPalette = baseConfig.palette;
  if (autoTheme && repo.primaryLanguage?.color) {
    newPalette = ThemeEngine.generatePaletteFromLanguageColor(repo.primaryLanguage.color, 'dark');
  }

  const suggestedCmd = suggestInstallCommand(
    repo.languages,
    repo.topics,
    repo.name,
    repo.owner.login
  );

  return {
    ...baseConfig,
    templateId,
    backgroundPattern: signaturePattern
      ? { ...baseConfig.backgroundPattern, id: signaturePattern }
      : baseConfig.backgroundPattern,
    title: repo.name,
    tagline: clampGraphemeLength(
      repo.description || 'Modern developer tool and open source project.',
      500
    ),
    installCommand: suggestedCmd,
    palette: newPalette,
  };
}

interface CardStoreState {
  repo: RepoMetadata;
  config: CardConfig;
  hasCustomRepo: boolean;
  hydratedRouteKey: string | null;
  past: CardConfig[];
  future: CardConfig[];
  zoom: number;
  showSafeZoneGuides: boolean;
  isFetchingRepo: boolean;
  fetchingRepoName: string | null;
  fetchError: string | null;
  activeRightTab: 'templates' | 'theme' | 'background' | 'typography' | 'vault';
  isExportModalOpen: boolean;
  viewMode: 'canvas' | 'social';

  // Actions
  setRepo: (repo: RepoMetadata, autoTheme?: boolean) => void;
  updateRepo: (partial: Partial<RepoMetadata>) => void;
  syncDefaultRepoMetadata: (repo: RepoMetadata) => void;
  hydrateRepo: (repo: RepoMetadata, options?: HydrateRepoOptions) => void;
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
  setIsFetchingRepo: (fetching: boolean, repoName?: string | null) => void;
  setFetchError: (error: string | null) => void;

  // History Actions
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  resetConfig: () => void;
}

const MAX_HISTORY = 30;

const useBaseCardStore = create<CardStoreState>((set, get) => ({
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

  setRepo: (repo, autoTheme = true) => {
    const nextConfig = deriveConfigForRepo(repo, get().config, { autoTheme });

    set((state) => ({
      repo,
      hasCustomRepo: true,
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.config],
      future: [],
      config: nextConfig,
      isFetchingRepo: false,
      fetchingRepoName: null,
      fetchError: null,
    }));
  },

  updateRepo: (partial) => {
    set((state) => ({
      repo: { ...state.repo, ...partial },
      hasCustomRepo: true,
    }));
  },

  syncDefaultRepoMetadata: (repo) => {
    set((state) => {
      if (state.hasCustomRepo || state.hydratedRouteKey) {
        return state;
      }
      return { repo };
    });
  },

  hydrateRepo: (repo, options) => {
    const nextConfig = deriveConfigForRepo(repo, get().config, options);
    const routeKey = `${repo.owner.login.toLowerCase()}/${repo.name.toLowerCase()}`;

    set({
      repo,
      hasCustomRepo: true,
      hydratedRouteKey: routeKey,
      past: [],
      future: [],
      config: nextConfig,
      isFetchingRepo: false,
      fetchingRepoName: null,
      fetchError: null,
    });
  },

  updateConfig: (partial) => {
    const normalizedPartial: Partial<CardConfig> = { ...partial };
    if (partial.customLogoUrl !== undefined) {
      normalizedPartial.customLogoUrl = sanitizeClientImageUrl(partial.customLogoUrl) || undefined;
    }
    if (partial.customBackgroundUrl !== undefined) {
      normalizedPartial.customBackgroundUrl =
        sanitizeClientImageUrl(partial.customBackgroundUrl) || undefined;
    }

    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), state.config],
      future: [],
      config: {
        ...state.config,
        ...normalizedPartial,
      },
    }));
  },

  setTemplateId: (rawTemplateId) => {
    const templateId = normalizeTemplateId(rawTemplateId);
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

  setIsFetchingRepo: (isFetchingRepo, fetchingRepoName = null) => {
    set({ isFetchingRepo, fetchingRepoName: isFetchingRepo ? fetchingRepoName : null });
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

export interface StudioHydrationOverride {
  repo?: RepoMetadata;
  config?: CardConfig;
  isPendingInitialRepo?: boolean;
}

export const StudioHydrationContext = createContext<StudioHydrationOverride | null>(null);

export function useIsInitialStreamPending(): boolean {
  const hydration = useContext(StudioHydrationContext);
  const hasCustomRepo = useBaseCardStore((state) => state.hasCustomRepo);
  return Boolean(hydration?.isPendingInitialRepo && !hasCustomRepo);
}

function useCardStoreHook(): CardStoreState;
function useCardStoreHook<T>(selector: (state: CardStoreState) => T): T;
function useCardStoreHook<T>(selector?: (state: CardStoreState) => T): T | CardStoreState {
  const hydrationOverride = useContext(StudioHydrationContext);
  const storeState = useBaseCardStore();
  const effectiveState =
    hydrationOverride?.repo && hydrationOverride?.config
      ? {
          ...storeState,
          repo: hydrationOverride.repo,
          config: hydrationOverride.config,
          hasCustomRepo: true,
        }
      : storeState;

  return selector ? selector(effectiveState) : effectiveState;
}

export const useCardStore = Object.assign(useCardStoreHook, {
  getState: useBaseCardStore.getState,
  setState: useBaseCardStore.setState,
  subscribe: useBaseCardStore.subscribe,
  getInitialState: useBaseCardStore.getInitialState,
});
