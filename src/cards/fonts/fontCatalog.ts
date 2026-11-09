export type FontCategory =
  'sans-serif' | 'display' | 'serif' | 'monospace' | 'handwriting' | 'other';

export type FontRole = 'heading' | 'mono' | 'all';

export type SupportedFontWeight = 400 | 500 | 600 | 700 | 800;

export const DEFAULT_HEADING_FONT = 'Inter';
export const DEFAULT_MONO_FONT = 'JetBrains Mono';

export const TARGET_FONT_WEIGHTS: readonly SupportedFontWeight[] = [400, 500, 600, 700, 800];

export interface FontCatalogEntry {
  id: string;
  family: string;
  category: FontCategory;
  weights: number[];
  defSubset: string;
  bundled?: boolean;
  featured?: boolean;
  badge?: string;
}

export interface FontPairingPreset {
  id: string;
  label: string;
  description: string;
  fontHeading: string;
  fontMono: string;
}

export const CURATED_HEADING_FONTS: readonly FontCatalogEntry[] = [
  {
    id: 'inter',
    family: 'Inter',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    bundled: true,
    featured: true,
    badge: 'Default Sans',
  },
  {
    id: 'geist',
    family: 'Geist',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Developer UI',
  },
  {
    id: 'space-grotesk',
    family: 'Space Grotesk',
    category: 'sans-serif',
    weights: [400, 500, 600, 700],
    defSubset: 'latin',
    featured: true,
    badge: 'Tech / Brutalist',
  },
  {
    id: 'plus-jakarta-sans',
    family: 'Plus Jakarta Sans',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Modern SaaS',
  },
  {
    id: 'outfit',
    family: 'Outfit',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Geometric',
  },
  {
    id: 'sora',
    family: 'Sora',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Crisp Tech',
  },
  {
    id: 'bricolage-grotesque',
    family: 'Bricolage Grotesque',
    category: 'display',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Editorial',
  },
  {
    id: 'dm-sans',
    family: 'DM Sans',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Balanced',
  },
  {
    id: 'manrope',
    family: 'Manrope',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Precision',
  },
  {
    id: 'syne',
    family: 'Syne',
    category: 'sans-serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Bold Display',
  },
  {
    id: 'ibm-plex-sans',
    family: 'IBM Plex Sans',
    category: 'sans-serif',
    weights: [400, 500, 600, 700],
    defSubset: 'latin',
    featured: true,
    badge: 'Industrial',
  },
  {
    id: 'newsreader',
    family: 'Newsreader',
    category: 'serif',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Editorial Serif',
  },
];

export const CURATED_MONO_FONTS: readonly FontCatalogEntry[] = [
  {
    id: 'jetbrains-mono',
    family: 'JetBrains Mono',
    category: 'monospace',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    bundled: true,
    featured: true,
    badge: 'Default Mono',
  },
  {
    id: 'geist-mono',
    family: 'Geist Mono',
    category: 'monospace',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Developer Mono',
  },
  {
    id: 'fira-code',
    family: 'Fira Code',
    category: 'monospace',
    weights: [400, 500, 600, 700],
    defSubset: 'latin',
    featured: true,
    badge: 'Code Ligatures',
  },
  {
    id: 'ibm-plex-mono',
    family: 'IBM Plex Mono',
    category: 'monospace',
    weights: [400, 500, 600, 700],
    defSubset: 'latin',
    featured: true,
    badge: 'Systems Mono',
  },
  {
    id: 'space-mono',
    family: 'Space Mono',
    category: 'monospace',
    weights: [400, 700],
    defSubset: 'latin',
    featured: true,
    badge: 'Retro Terminal',
  },
  {
    id: 'source-code-pro',
    family: 'Source Code Pro',
    category: 'monospace',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Classic IDE',
  },
  {
    id: 'inconsolata',
    family: 'Inconsolata',
    category: 'monospace',
    weights: [400, 500, 600, 700, 800],
    defSubset: 'latin',
    featured: true,
    badge: 'Compact CLI',
  },
  {
    id: 'ubuntu-mono',
    family: 'Ubuntu Mono',
    category: 'monospace',
    weights: [400, 700],
    defSubset: 'latin',
    featured: true,
    badge: 'Linux Shell',
  },
];

export const CURATED_FONTS: readonly FontCatalogEntry[] = [
  ...CURATED_HEADING_FONTS,
  ...CURATED_MONO_FONTS,
];

export const FONT_PAIRING_PRESETS: readonly FontPairingPreset[] = [
  {
    id: 'modern-default',
    label: 'Modern Default',
    description: 'Inter + JetBrains Mono',
    fontHeading: 'Inter',
    fontMono: 'JetBrains Mono',
  },
  {
    id: 'developer-geist',
    label: 'Developer UI',
    description: 'Geist + Geist Mono',
    fontHeading: 'Geist',
    fontMono: 'Geist Mono',
  },
  {
    id: 'brutalist-tech',
    label: 'Brutalist Tech',
    description: 'Space Grotesk + Space Mono',
    fontHeading: 'Space Grotesk',
    fontMono: 'Space Mono',
  },
  {
    id: 'editorial-craft',
    label: 'Editorial Craft',
    description: 'Bricolage Grotesque + IBM Plex Mono',
    fontHeading: 'Bricolage Grotesque',
    fontMono: 'IBM Plex Mono',
  },
  {
    id: 'geometric-saas',
    label: 'Geometric SaaS',
    description: 'Outfit + Fira Code',
    fontHeading: 'Outfit',
    fontMono: 'Fira Code',
  },
];

const CURATED_BY_FAMILY = new Map<string, FontCatalogEntry>(
  CURATED_FONTS.map((entry) => [entry.family.toLowerCase(), entry])
);

const CURATED_BY_ID = new Map<string, FontCatalogEntry>(
  CURATED_FONTS.map((entry) => [entry.id, entry])
);

const SAFE_FAMILY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .+-]{0,63}$/;
const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates a font family name against CSS/URL injection and returns a safe family string.
 */
export function sanitizeFontFamily(
  raw: string | null | undefined,
  fallback = DEFAULT_HEADING_FONT
): string {
  if (!raw) return fallback;
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!SAFE_FAMILY_PATTERN.test(trimmed)) {
    return fallback;
  }
  const curated = CURATED_BY_FAMILY.get(trimmed.toLowerCase());
  return curated ? curated.family : trimmed;
}

/**
 * Converts a display family name (e.g. "Space Grotesk") into a safe Fontsource slug ("space-grotesk").
 */
export function familyToFontsourceId(family: string): string | null {
  const trimmed = family.trim();
  if (!trimmed) return null;

  const curated = CURATED_BY_FAMILY.get(trimmed.toLowerCase());
  if (curated) return curated.id;

  const slug = trimmed
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug || slug.length > 64 || !SAFE_SLUG_PATTERN.test(slug)) {
    return null;
  }
  return slug;
}

export function getCuratedFontByFamily(family: string): FontCatalogEntry | undefined {
  return CURATED_BY_FAMILY.get(family.trim().toLowerCase());
}

export function getCuratedFontById(id: string): FontCatalogEntry | undefined {
  return CURATED_BY_ID.get(id.trim().toLowerCase());
}

export function normalizeFontCategory(raw?: string | null): FontCategory {
  switch (raw) {
    case 'sans-serif':
    case 'display':
    case 'serif':
    case 'monospace':
    case 'handwriting':
      return raw;
    default:
      return 'other';
  }
}

/**
 * Picks the subset of Satori/browser weights (400..800) supported by a font family.
 */
export function selectWeightsForFont(
  availableWeights: readonly number[],
  previewOnly = false
): SupportedFontWeight[] {
  const desired: readonly SupportedFontWeight[] = previewOnly ? [400, 700] : TARGET_FONT_WEIGHTS;
  const availableSet = new Set(availableWeights);
  const matched = desired.filter((w) => availableSet.has(w));
  if (matched.length > 0) {
    return matched;
  }
  if (availableSet.has(400)) {
    return [400];
  }
  return [400, 700];
}

export function buildFontsourceBinaryUrl(
  id: string,
  subset: string,
  weight: number,
  ext: 'ttf' | 'woff' | 'woff2'
): string {
  const safeId = SAFE_SLUG_PATTERN.test(id) ? id : 'inter';
  const safeSubset = SAFE_SLUG_PATTERN.test(subset) ? subset : 'latin';
  const safeWeight = Number.isInteger(weight) && weight >= 100 && weight <= 900 ? weight : 400;
  return `https://cdn.jsdelivr.net/fontsource/fonts/${safeId}@latest/${safeSubset}-${safeWeight}-normal.${ext}`;
}

/**
 * Generates @font-face declarations using Fontsource CDN WOFF2 files so the browser Studio
 * preview matches the exact version and metrics used by Satori's server-side TTF loader.
 */
export function buildFontsourceFaceCss(
  entry: Pick<FontCatalogEntry, 'id' | 'family' | 'weights' | 'defSubset'>,
  previewOnly = false
): string {
  const safeFamily = sanitizeFontFamily(entry.family, '');
  if (!safeFamily || !SAFE_SLUG_PATTERN.test(entry.id)) {
    return '';
  }

  const subset =
    entry.defSubset && SAFE_SLUG_PATTERN.test(entry.defSubset) ? entry.defSubset : 'latin';
  const weights = selectWeightsForFont(entry.weights, previewOnly);

  return weights
    .map((weight) => {
      const woff2Url = buildFontsourceBinaryUrl(entry.id, subset, weight, 'woff2');
      const woffUrl = buildFontsourceBinaryUrl(entry.id, subset, weight, 'woff');
      return `@font-face{font-family:'${safeFamily}';font-style:normal;font-weight:${weight};font-display:swap;src:url('${woff2Url}') format('woff2'),url('${woffUrl}') format('woff');}`;
    })
    .join('\n');
}

export function matchesFontRole(entry: FontCatalogEntry, role: FontRole): boolean {
  if (role === 'all') return true;
  if (role === 'mono') return entry.category === 'monospace';
  return entry.category !== 'monospace';
}

/**
 * Filters and ranks catalog entries, keeping curated featured fonts first when query is empty
 * and ranking exact/prefix matches ahead of substring matches when searching.
 */
export function filterFontCatalog(
  entries: readonly FontCatalogEntry[],
  options: { role?: FontRole; query?: string; limit?: number } = {}
): FontCatalogEntry[] {
  const role = options.role ?? 'all';
  const query = (options.query ?? '').trim().toLowerCase();
  const limit = Math.min(Math.max(options.limit ?? 40, 1), 100);

  const roleFiltered = entries.filter((entry) => matchesFontRole(entry, role));

  if (!query) {
    const featured: FontCatalogEntry[] = [];
    const rest: FontCatalogEntry[] = [];
    for (const entry of roleFiltered) {
      if (entry.featured) {
        featured.push(entry);
      } else {
        rest.push(entry);
      }
    }
    return [...featured, ...rest].slice(0, limit);
  }

  const scored: Array<{ entry: FontCatalogEntry; score: number }> = [];
  for (const entry of roleFiltered) {
    const familyLower = entry.family.toLowerCase();
    const idLower = entry.id.toLowerCase();
    if (familyLower === query || idLower === query) {
      scored.push({ entry, score: 0 - (entry.featured ? 1 : 0) });
    } else if (familyLower.startsWith(query) || idLower.startsWith(query)) {
      scored.push({ entry, score: 10 - (entry.featured ? 2 : 0) });
    } else if (familyLower.includes(query) || idLower.includes(query)) {
      scored.push({ entry, score: 20 - (entry.featured ? 2 : 0) });
    }
  }

  scored.sort((a, b) => a.score - b.score || a.entry.family.localeCompare(b.entry.family));
  return scored.slice(0, limit).map((item) => item.entry);
}
