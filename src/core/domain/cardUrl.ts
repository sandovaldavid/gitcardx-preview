import {
  BackgroundPatternConfigSchema,
  ColorSchema,
  normalizeTemplateId,
  type BackgroundPatternConfig,
  type CardConfig,
  type CardVisibility,
  type ContentAlign,
  type Palette,
  type RepoMetadata,
  type TemplateId,
} from './schemas';
import { suggestInstallCommand } from './stackMapper';
import { PRESET_PALETTES, ThemeEngine } from '../theme/ThemeEngine';
import { sanitizeImageUrl } from '../security/ssrf';
import {
  DEFAULT_HEADING_FONT,
  DEFAULT_MONO_FONT,
  sanitizeFontFamily,
} from '@/cards/fonts/fontCatalog';
import {
  TEMPLATE_CAPABILITIES,
  TEMPLATE_SIGNATURE_PATTERNS,
} from '@/cards/templates/templateCapabilities';

export interface CardUrlBuildOptions {
  variant?: 'exact' | 'dark' | 'light';
  ref?: string;
}

const API_VISIBILITY_DEFAULTS: CardVisibility = {
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
};

const API_DEFAULT_BG_OPACITY = 0.45;

/**
 * Parses and validates a CSS color query parameter. Prepends `#` only for raw
 * 3-, 6-, or 8-digit hex strings so `rgb(...)`/`hsl(...)` values pass intact.
 */
export function parseColorParam(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const candidate = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(trimmed)
    ? `#${trimmed}`
    : trimmed;

  const parsed = ColorSchema.safeParse(candidate);
  return parsed.success ? parsed.data : undefined;
}

function formatColorParam(color: string): string {
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]+$/.test(trimmed)) {
    return trimmed.slice(1).toLowerCase();
  }
  return trimmed;
}

export function findMatchingPresetPalette(palette: Palette): string | null {
  const norm = (value: string) => value.trim().toLowerCase();
  for (const [key, preset] of Object.entries(PRESET_PALETTES)) {
    if (
      norm(palette.background) === norm(preset.background) &&
      norm(palette.text) === norm(preset.text) &&
      norm(palette.accent) === norm(preset.accent) &&
      norm(palette.border) === norm(preset.border)
    ) {
      return key;
    }
  }
  return null;
}

export function isShareableHttpsImageUrl(rawUrl?: string | null): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();
  if (!trimmed.toLowerCase().startsWith('https://')) return false;
  return sanitizeImageUrl(trimmed, '') !== '';
}

export function getNonShareableCustomAssets(config: CardConfig): Array<'logo' | 'background'> {
  const reasons: Array<'logo' | 'background'> = [];
  if (
    config.customLogoUrl &&
    config.customLogoUrl.trim() &&
    !isShareableHttpsImageUrl(config.customLogoUrl)
  ) {
    reasons.push('logo');
  }
  if (
    config.customBackgroundUrl &&
    config.customBackgroundUrl.trim() &&
    !isShareableHttpsImageUrl(config.customBackgroundUrl)
  ) {
    reasons.push('background');
  }
  return reasons;
}

/**
 * Encodes `URLSearchParams` cleanly for Markdown links by percent-encoding
 * parentheses and quotes that would prematurely close `[alt](url)` syntax.
 */
export function serializeSearchParamsForLinks(params: URLSearchParams): string {
  return params
    .toString()
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/'/g, '%27')
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A');
}

export function buildCardQueryParams(
  config: CardConfig,
  repo: RepoMetadata,
  options: CardUrlBuildOptions = {}
): URLSearchParams {
  const params = new URLSearchParams();
  const variant = options.variant ?? 'exact';
  const templateId = normalizeTemplateId(config.templateId);
  const capabilities = TEMPLATE_CAPABILITIES[templateId];

  if (templateId !== 'modern-minimal') {
    params.set('template', templateId);
  }

  // Theme & Palette fidelity
  const isLightPalette = ThemeEngine.isLightColor(config.palette.background);
  const effectiveTheme: 'dark' | 'light' =
    variant === 'light' ? 'light' : variant === 'dark' ? 'dark' : isLightPalette ? 'light' : 'dark';
  const isCrossSchemeAdaptive =
    (variant === 'light' && !isLightPalette) || (variant === 'dark' && isLightPalette);

  if (isCrossSchemeAdaptive) {
    params.set('theme', effectiveTheme);
    params.set('accent', formatColorParam(config.palette.accent));
  } else {
    if (effectiveTheme === 'light' || variant !== 'exact') {
      params.set('theme', effectiveTheme);
    }

    const matchedPreset = findMatchingPresetPalette(config.palette);
    if (matchedPreset) {
      params.set('preset', matchedPreset);
    } else {
      params.set('pbg', formatColorParam(config.palette.background));
      params.set('ptext', formatColorParam(config.palette.text));
      params.set('accent', formatColorParam(config.palette.accent));
      params.set('pborder', formatColorParam(config.palette.border));
    }
  }

  // Card text & alignment
  if (config.title && config.title !== repo.name) {
    params.set('title', config.title);
  }

  const defaultApiTagline = repo.description || 'GitHub repository visual identity';
  if (config.tagline !== defaultApiTagline) {
    if (config.tagline === 'false') {
      params.set('tagline_text', 'false');
    } else {
      params.set('tagline', config.tagline);
    }
  }

  const defaultCmd = suggestInstallCommand(
    repo.languages,
    repo.topics,
    repo.name,
    repo.owner.login
  );
  if (
    config.installCommand !== undefined &&
    config.installCommand !== '' &&
    (capabilities.visibility.installCommand || config.installCommand !== defaultCmd)
  ) {
    params.set('command', config.installCommand);
  }

  if (config.contentAlign === 'center') {
    params.set('align', 'center');
  }

  // Background pattern & HTTPS assets
  const signaturePattern = TEMPLATE_SIGNATURE_PATTERNS[templateId];
  if (
    config.backgroundPattern.id !== 'architectural-grid' ||
    (signaturePattern && signaturePattern !== config.backgroundPattern.id)
  ) {
    params.set('bg', config.backgroundPattern.id);
  }

  const roundedOpacity = Number(config.backgroundPattern.opacity.toFixed(2));
  if (roundedOpacity !== API_DEFAULT_BG_OPACITY) {
    params.set('bg_opacity', String(roundedOpacity));
  }

  if (config.backgroundPattern.scale !== undefined && config.backgroundPattern.scale !== 1) {
    params.set('bg_scale', String(config.backgroundPattern.scale));
  }

  if (config.backgroundPattern.color) {
    params.set('bg_color', formatColorParam(config.backgroundPattern.color));
  }

  if (isShareableHttpsImageUrl(config.customBackgroundUrl)) {
    params.set('bg_url', config.customBackgroundUrl!.trim());
  }

  if (isShareableHttpsImageUrl(config.customLogoUrl)) {
    params.set('logo_url', config.customLogoUrl!.trim());
  }

  // Typography
  if (config.typography?.fontHeading && config.typography.fontHeading !== DEFAULT_HEADING_FONT) {
    params.set('font_heading', config.typography.fontHeading);
  }
  if (config.typography?.fontMono && config.typography.fontMono !== DEFAULT_MONO_FONT) {
    params.set('font_mono', config.typography.fontMono);
  }

  // Visibility layer overrides
  if (!config.visibility.stars) params.set('stars', 'false');
  if (!config.visibility.forks) params.set('forks', 'false');
  if (!config.visibility.release) params.set('release', 'false');
  if (!config.visibility.license) params.set('license', 'false');
  if (!config.visibility.contributors) params.set('contributors', 'false');
  if (!config.visibility.techStack) params.set('stack', 'false');
  if (!config.visibility.languageLogos) params.set('logos', 'false');
  if (!config.visibility.author) params.set('author', 'false');
  if (!config.visibility.tagline) params.set('show_tagline', 'false');
  if (!config.visibility.installCommand) params.set('install', 'false');
  if (config.visibility.issues) params.set('issues', 'true');
  if (config.visibility.discussions) params.set('discussions', 'true');

  if (options.ref) {
    params.set('ref', options.ref);
  }

  return params;
}

export function buildCardImageUrl(
  baseUrl: string,
  owner: string,
  repoName: string,
  config: CardConfig,
  repo: RepoMetadata,
  options: CardUrlBuildOptions = {}
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const query = serializeSearchParamsForLinks(buildCardQueryParams(config, repo, options));
  return `${cleanBase}/api/card/${owner}/${repoName}.png${query ? `?${query}` : ''}`;
}

export function buildStudioShareUrl(
  baseUrl: string,
  owner: string,
  repoName: string,
  config: CardConfig,
  repo: RepoMetadata,
  options: { ref?: string } = {}
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const query = serializeSearchParamsForLinks(
    buildCardQueryParams(config, repo, { variant: 'exact', ref: options.ref })
  );
  return `${cleanBase}/${owner}/${repoName}${query ? `?${query}` : ''}`;
}

interface ExtractedUrlOverrides {
  hasTemplate: boolean;
  templateId?: TemplateId;
  hasTheme: boolean;
  themeMode: 'dark' | 'light';
  preset?: string;
  pbg?: string;
  ptext?: string;
  accent?: string;
  pborder?: string;
  title?: string;
  tagline?: string;
  hasTaglineText: boolean;
  installCommand?: string;
  contentAlign?: ContentAlign;
  bgPatternId?: BackgroundPatternConfig['id'];
  bgOpacity?: number;
  bgScale?: number;
  bgColor?: string;
  bgUrl?: string;
  logoUrl?: string;
  fontHeading?: string;
  fontMono?: string;
  visibilityOverrides: Partial<CardVisibility>;
}

function extractUrlOverrides(searchParams: URLSearchParams): ExtractedUrlOverrides {
  const rawTemplate = searchParams.get('template');
  const hasTemplate = rawTemplate !== null && rawTemplate !== '';
  const templateId = hasTemplate ? normalizeTemplateId(rawTemplate) : undefined;

  const rawTheme = searchParams.get('theme');
  const hasTheme = rawTheme === 'light' || rawTheme === 'dark';
  const themeMode: 'dark' | 'light' = rawTheme === 'light' ? 'light' : 'dark';

  const rawPreset = searchParams.get('preset');
  const preset = rawPreset && rawPreset in PRESET_PALETTES ? rawPreset : undefined;

  const pbg = parseColorParam(searchParams.get('pbg'));
  const ptext = parseColorParam(searchParams.get('ptext'));
  const accent = parseColorParam(searchParams.get('accent'));
  const pborder = parseColorParam(searchParams.get('pborder'));

  const rawTitle = searchParams.get('title');
  const title = rawTitle ? rawTitle.slice(0, 100) : undefined;

  const rawTaglineText = searchParams.get('tagline_text');
  const rawTagline = searchParams.get('tagline');
  const showTaglineParam = searchParams.get('show_tagline');

  let tagline: string | undefined;
  let hasTaglineText = false;
  if (rawTaglineText !== null) {
    tagline = rawTaglineText.slice(0, 500);
    hasTaglineText = true;
  } else if (rawTagline !== null && (rawTagline !== 'false' || showTaglineParam === 'true')) {
    tagline = rawTagline.slice(0, 500);
    hasTaglineText = true;
  }

  const rawCommand = searchParams.get('command') ?? searchParams.get('cli');
  const installCommand = rawCommand ? rawCommand.slice(0, 120) : undefined;

  const rawAlign = searchParams.get('align');
  const contentAlign: ContentAlign | undefined =
    rawAlign === 'center' ? 'center' : rawAlign === 'left' ? 'left' : undefined;

  const rawBg = searchParams.get('bg');
  const bgParsed = rawBg ? BackgroundPatternConfigSchema.shape.id.safeParse(rawBg) : null;
  const bgPatternId = bgParsed?.success ? bgParsed.data : undefined;

  const rawBgOpacity = searchParams.get('bg_opacity');
  const parsedOpacity = rawBgOpacity !== null && rawBgOpacity !== '' ? Number(rawBgOpacity) : NaN;
  const bgOpacity = !Number.isNaN(parsedOpacity)
    ? Math.min(Math.max(parsedOpacity, 0), 1)
    : undefined;

  const rawBgScale = searchParams.get('bg_scale');
  const parsedScale = rawBgScale !== null && rawBgScale !== '' ? Number(rawBgScale) : NaN;
  const bgScale =
    !Number.isNaN(parsedScale) && parsedScale > 0
      ? Math.min(Math.max(parsedScale, 0.25), 4)
      : undefined;

  const bgColor = parseColorParam(searchParams.get('bg_color'));

  const rawBgUrl = searchParams.get('bg_url');
  const bgUrl = rawBgUrl ? sanitizeImageUrl(rawBgUrl) || undefined : undefined;

  const rawLogoUrl = searchParams.get('logo_url');
  const logoUrl = rawLogoUrl ? sanitizeImageUrl(rawLogoUrl) || undefined : undefined;

  const rawHeading = searchParams.get('font_heading') || searchParams.get('fontHeading');
  const fontHeading = rawHeading ? sanitizeFontFamily(rawHeading, DEFAULT_HEADING_FONT) : undefined;

  const rawMono = searchParams.get('font_mono') || searchParams.get('fontMono');
  const fontMono = rawMono ? sanitizeFontFamily(rawMono, DEFAULT_MONO_FONT) : undefined;

  const visibilityOverrides: Partial<CardVisibility> = {};
  if (searchParams.has('stars')) visibilityOverrides.stars = searchParams.get('stars') !== 'false';
  if (searchParams.has('forks')) visibilityOverrides.forks = searchParams.get('forks') !== 'false';
  if (searchParams.has('release')) {
    visibilityOverrides.release = searchParams.get('release') !== 'false';
  }
  if (searchParams.has('license')) {
    visibilityOverrides.license = searchParams.get('license') !== 'false';
  }
  if (searchParams.has('contributors')) {
    visibilityOverrides.contributors = searchParams.get('contributors') !== 'false';
  }
  if (searchParams.has('stack')) {
    visibilityOverrides.techStack = searchParams.get('stack') !== 'false';
  }
  if (searchParams.has('logos')) {
    visibilityOverrides.languageLogos = searchParams.get('logos') !== 'false';
  }
  if (searchParams.has('author')) {
    visibilityOverrides.author = searchParams.get('author') !== 'false';
  }
  if (showTaglineParam !== null) {
    visibilityOverrides.tagline = showTaglineParam !== 'false';
  } else if (rawTagline === 'false') {
    visibilityOverrides.tagline = false;
  }
  if (searchParams.has('install') || searchParams.has('installCommand')) {
    visibilityOverrides.installCommand =
      searchParams.get('install') !== 'false' && searchParams.get('installCommand') !== 'false';
  }
  if (searchParams.has('issues'))
    visibilityOverrides.issues = searchParams.get('issues') === 'true';
  if (searchParams.has('discussions')) {
    visibilityOverrides.discussions = searchParams.get('discussions') === 'true';
  }

  return {
    hasTemplate,
    templateId,
    hasTheme,
    themeMode,
    preset,
    pbg,
    ptext,
    accent,
    pborder,
    title,
    tagline,
    hasTaglineText,
    installCommand,
    contentAlign,
    bgPatternId,
    bgOpacity,
    bgScale,
    bgColor,
    bgUrl,
    logoUrl,
    fontHeading,
    fontMono,
    visibilityOverrides,
  };
}

/**
 * Builds the complete `CardConfig` for `/api/card/[owner]/[repo]` from query parameters.
 */
export function parseCardConfigFromSearchParams(
  searchParams: URLSearchParams,
  repoMetadata: RepoMetadata
): CardConfig {
  const o = extractUrlOverrides(searchParams);

  let palette: Palette;
  if (o.preset) {
    palette = { ...PRESET_PALETTES[o.preset] };
  } else if (o.pbg || o.ptext || o.pborder || o.accent) {
    palette = {
      ...(o.themeMode === 'light'
        ? PRESET_PALETTES['light-paper']
        : PRESET_PALETTES['slate-minimal']),
    };
  } else if (repoMetadata.primaryLanguage?.color) {
    palette = ThemeEngine.generatePaletteFromLanguageColor(
      repoMetadata.primaryLanguage.color,
      o.themeMode
    );
  } else {
    palette = {
      ...(o.themeMode === 'light'
        ? PRESET_PALETTES['light-paper']
        : PRESET_PALETTES['slate-minimal']),
    };
  }

  if (o.pbg) palette.background = o.pbg;
  if (o.ptext) palette.text = o.ptext;
  if (o.accent) palette.accent = o.accent;
  if (o.pborder) palette.border = o.pborder;

  const fallbackTagline = repoMetadata.description || 'GitHub repository visual identity';

  return {
    templateId: o.templateId ?? 'modern-minimal',
    title: o.title ?? repoMetadata.name.slice(0, 100),
    tagline: o.hasTaglineText ? (o.tagline ?? '') : fallbackTagline.slice(0, 500),
    installCommand: o.installCommand,
    contentAlign: o.contentAlign ?? 'left',
    palette,
    customLogoUrl: o.logoUrl,
    customBackgroundUrl: o.bgUrl,
    typography: {
      fontHeading: o.fontHeading ?? DEFAULT_HEADING_FONT,
      fontMono: o.fontMono ?? DEFAULT_MONO_FONT,
    },
    backgroundPattern: {
      id: o.bgPatternId ?? 'architectural-grid',
      opacity: o.bgOpacity ?? API_DEFAULT_BG_OPACITY,
      ...(o.bgScale ? { scale: o.bgScale } : {}),
      ...(o.bgColor ? { color: o.bgColor } : {}),
    },
    visibility: {
      ...API_VISIBILITY_DEFAULTS,
      ...o.visibilityOverrides,
    },
  };
}

/**
 * Applies URL query overrides on top of an existing Studio `CardConfig`
 * without wiping repo-derived defaults for omitted parameters.
 */
export function applyCardUrlParamsToConfig(
  baseConfig: CardConfig,
  searchParams: URLSearchParams,
  repoMetadata: RepoMetadata
): CardConfig {
  const o = extractUrlOverrides(searchParams);
  const nextTemplateId = o.templateId ?? baseConfig.templateId;

  let nextPalette = { ...baseConfig.palette };
  if (o.preset) {
    nextPalette = { ...PRESET_PALETTES[o.preset] };
  } else if (o.hasTheme && !o.pbg && !o.ptext && !o.pborder) {
    if (o.accent) {
      nextPalette = {
        ...(o.themeMode === 'light'
          ? PRESET_PALETTES['light-paper']
          : PRESET_PALETTES['slate-minimal']),
      };
    } else if (repoMetadata.primaryLanguage?.color) {
      nextPalette = ThemeEngine.generatePaletteFromLanguageColor(
        repoMetadata.primaryLanguage.color,
        o.themeMode
      );
    } else {
      nextPalette = {
        ...(o.themeMode === 'light'
          ? PRESET_PALETTES['light-paper']
          : PRESET_PALETTES['slate-minimal']),
      };
    }
  }

  if (o.pbg) nextPalette.background = o.pbg;
  if (o.ptext) nextPalette.text = o.ptext;
  if (o.accent) nextPalette.accent = o.accent;
  if (o.pborder) nextPalette.border = o.pborder;

  const signaturePattern = o.hasTemplate ? TEMPLATE_SIGNATURE_PATTERNS[nextTemplateId] : undefined;
  const nextPattern: BackgroundPatternConfig = {
    ...baseConfig.backgroundPattern,
    id: o.bgPatternId ?? signaturePattern ?? baseConfig.backgroundPattern.id,
    ...(o.bgOpacity !== undefined ? { opacity: o.bgOpacity } : {}),
    ...(o.bgScale !== undefined ? { scale: o.bgScale } : {}),
    ...(o.bgColor !== undefined ? { color: o.bgColor } : {}),
  };

  return {
    ...baseConfig,
    templateId: nextTemplateId,
    ...(o.title !== undefined ? { title: o.title } : {}),
    ...(o.hasTaglineText ? { tagline: o.tagline ?? '' } : {}),
    ...(o.installCommand !== undefined ? { installCommand: o.installCommand } : {}),
    ...(o.contentAlign !== undefined ? { contentAlign: o.contentAlign } : {}),
    palette: nextPalette,
    ...(o.logoUrl !== undefined ? { customLogoUrl: o.logoUrl } : {}),
    ...(o.bgUrl !== undefined ? { customBackgroundUrl: o.bgUrl } : {}),
    typography: {
      fontHeading: o.fontHeading ?? baseConfig.typography.fontHeading,
      fontMono: o.fontMono ?? baseConfig.typography.fontMono,
    },
    backgroundPattern: nextPattern,
    visibility: {
      ...baseConfig.visibility,
      ...o.visibilityOverrides,
    },
  };
}
