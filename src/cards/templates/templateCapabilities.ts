import type {
  BackgroundPatternConfig,
  CardConfig,
  CardVisibility,
  RepoMetadata,
  TemplateId,
} from '@/core/domain/schemas';
import { normalizeTemplateId } from '@/core/domain/schemas';
import { detectTechStack } from '@/core/domain/stackMapper';
import { getLanguageLogo } from '@/cards/icons/languageLogos';

export const TEMPLATE_SIGNATURE_PATTERNS: Partial<
  Record<TemplateId, BackgroundPatternConfig['id']>
> = {
  'aurora-glass': 'aurora-mesh',
  'blueprint-grid': 'architectural-grid',
  'version-hero': 'radial-spotlight',
};

export interface TemplateCapabilities {
  visibility: Readonly<Record<keyof CardVisibility, boolean>>;
  supportsCustomLogo: boolean;
  maxTechStackItems: number;
  primaryLanguageLogoMode: 'none' | 'always' | 'with-author';
  releaseHasFallback: boolean;
}

export const TEMPLATE_CAPABILITIES: Readonly<Record<TemplateId, TemplateCapabilities>> = {
  'modern-minimal': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: false,
      license: true,
      techStack: true,
      languageLogos: true,
      installCommand: false,
      contributors: false,
    },
    supportsCustomLogo: true,
    maxTechStackItems: 5,
    primaryLanguageLogoMode: 'always',
    releaseHasFallback: false,
  },
  'terminal-prompt': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: true,
      license: true,
      techStack: false,
      languageLogos: false,
      installCommand: true,
      contributors: false,
    },
    supportsCustomLogo: false,
    maxTechStackItems: 0,
    primaryLanguageLogoMode: 'none',
    releaseHasFallback: false,
  },
  'metric-showcase': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: true,
      license: true,
      techStack: true,
      languageLogos: true,
      installCommand: false,
      contributors: true,
    },
    supportsCustomLogo: true,
    maxTechStackItems: 4,
    primaryLanguageLogoMode: 'none',
    releaseHasFallback: false,
  },
  'split-console': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: true,
      license: true,
      techStack: true,
      languageLogos: true,
      installCommand: true,
      contributors: false,
    },
    supportsCustomLogo: true,
    maxTechStackItems: 4,
    primaryLanguageLogoMode: 'none',
    releaseHasFallback: false,
  },
  'aurora-glass': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: true,
      license: true,
      techStack: true,
      languageLogos: true,
      installCommand: false,
      contributors: false,
    },
    supportsCustomLogo: true,
    maxTechStackItems: 5,
    primaryLanguageLogoMode: 'none',
    releaseHasFallback: false,
  },
  'blueprint-grid': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: false,
      license: true,
      techStack: true,
      languageLogos: true,
      installCommand: false,
      contributors: false,
    },
    supportsCustomLogo: false,
    maxTechStackItems: 5,
    primaryLanguageLogoMode: 'none',
    releaseHasFallback: false,
  },
  'version-hero': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: true,
      license: true,
      techStack: true,
      languageLogos: true,
      installCommand: false,
      contributors: false,
    },
    supportsCustomLogo: true,
    maxTechStackItems: 5,
    primaryLanguageLogoMode: 'none',
    releaseHasFallback: true,
  },
  'author-spotlight': {
    visibility: {
      author: true,
      tagline: true,
      stars: true,
      forks: true,
      issues: true,
      discussions: true,
      release: true,
      license: true,
      techStack: true,
      languageLogos: true,
      installCommand: false,
      contributors: false,
    },
    supportsCustomLogo: true,
    maxTechStackItems: 4,
    primaryLanguageLogoMode: 'with-author',
    releaseHasFallback: false,
  },
};

export type LayerUnavailableReason = 'not-in-template' | 'no-data' | 'parent-hidden';

export interface LayerVisibilityState {
  key: keyof CardVisibility;
  supportedByTemplate: boolean;
  available: boolean;
  enabled: boolean;
  visibleOnCard: boolean;
  unavailableReason?: LayerUnavailableReason;
}

export function getTemplateCapabilities(templateId: TemplateId | string): TemplateCapabilities {
  return TEMPLATE_CAPABILITIES[normalizeTemplateId(templateId)];
}

/**
 * Evaluates whether a visibility layer is supported by the active template,
 * has renderable repository data/parent slots, and is currently shown on the card.
 */
export function getLayerVisibilityState(
  key: keyof CardVisibility,
  templateId: TemplateId | string,
  repo: RepoMetadata,
  config: Pick<CardConfig, 'visibility'>
): LayerVisibilityState {
  const capabilities = getTemplateCapabilities(templateId);
  const supportedByTemplate = capabilities.visibility[key];
  const enabled = config.visibility[key];

  if (!supportedByTemplate) {
    return {
      key,
      supportedByTemplate: false,
      available: false,
      enabled,
      visibleOnCard: false,
      unavailableReason: 'not-in-template',
    };
  }

  let available = true;
  let unavailableReason: LayerUnavailableReason | undefined;

  switch (key) {
    case 'author':
    case 'tagline':
    case 'stars':
    case 'forks':
    case 'installCommand':
      available = true;
      break;

    case 'issues':
      available = typeof repo.openIssuesCount === 'number';
      if (!available) unavailableReason = 'no-data';
      break;

    case 'discussions':
      available = typeof repo.discussionsCount === 'number';
      if (!available) unavailableReason = 'no-data';
      break;

    case 'release':
      available = capabilities.releaseHasFallback || Boolean(repo.latestRelease?.tag);
      if (!available) unavailableReason = 'no-data';
      break;

    case 'license':
      available = Boolean(repo.license);
      if (!available) unavailableReason = 'no-data';
      break;

    case 'techStack': {
      const stack = detectTechStack(repo.languages, repo.topics, capabilities.maxTechStackItems);
      available = stack.length > 0;
      if (!available) unavailableReason = 'no-data';
      break;
    }

    case 'contributors':
      available = repo.contributors.length > 0;
      if (!available) unavailableReason = 'no-data';
      break;

    case 'languageLogos': {
      const stack =
        capabilities.maxTechStackItems > 0
          ? detectTechStack(repo.languages, repo.topics, capabilities.maxTechStackItems)
          : [];
      const stackHasLogo = stack.some((item) =>
        Boolean(getLanguageLogo(item.id) || getLanguageLogo(item.name))
      );
      const primaryHasLogo = Boolean(
        repo.primaryLanguage && getLanguageLogo(repo.primaryLanguage.name)
      );

      const hasAnyTarget =
        stackHasLogo || (capabilities.primaryLanguageLogoMode !== 'none' && primaryHasLogo);

      if (!hasAnyTarget) {
        available = false;
        unavailableReason = 'no-data';
        break;
      }

      const stackActive = config.visibility.techStack && stackHasLogo;
      const primaryActive =
        primaryHasLogo &&
        (capabilities.primaryLanguageLogoMode === 'always' ||
          (capabilities.primaryLanguageLogoMode === 'with-author' && config.visibility.author));

      available = stackActive || primaryActive;
      if (!available) {
        unavailableReason = 'parent-hidden';
      }
      break;
    }
  }

  return {
    key,
    supportedByTemplate: true,
    available,
    enabled,
    visibleOnCard: available && enabled,
    ...(unavailableReason ? { unavailableReason } : {}),
  };
}

export function getAllLayerVisibilityStates(
  keys: ReadonlyArray<keyof CardVisibility>,
  templateId: TemplateId | string,
  repo: RepoMetadata,
  config: Pick<CardConfig, 'visibility'>
): LayerVisibilityState[] {
  return keys.map((key) => getLayerVisibilityState(key, templateId, repo, config));
}
