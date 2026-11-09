import { isAllowedFontUrl } from '@/core/security/ssrf';
import {
  CURATED_FONTS,
  familyToFontsourceId,
  filterFontCatalog,
  getCuratedFontByFamily,
  getCuratedFontById,
  normalizeFontCategory,
  type FontCatalogEntry,
  type FontRole,
} from './fontCatalog';

const FONTSOURCE_CATALOG_URL = 'https://api.fontsource.org/v1/fonts';
const CATALOG_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT_MS = 4000;
const MAX_SINGLE_METADATA_CACHE = 256;

interface RawFontsourceItem {
  id?: unknown;
  family?: unknown;
  category?: unknown;
  weights?: unknown;
  defSubset?: unknown;
  subsets?: unknown;
}

interface CatalogCacheState {
  entries: FontCatalogEntry[];
  expiresAtMs: number;
}

let catalogCache: CatalogCacheState | null = null;
let inflightCatalogPromise: Promise<FontCatalogEntry[]> | null = null;
const singleMetadataCache = new Map<string, FontCatalogEntry | null>();

function setSingleMetadataCache(key: string, value: FontCatalogEntry | null): void {
  if (singleMetadataCache.has(key)) {
    singleMetadataCache.delete(key);
  }
  singleMetadataCache.set(key, value);
  if (singleMetadataCache.size > MAX_SINGLE_METADATA_CACHE) {
    const oldestKey = singleMetadataCache.keys().next().value;
    if (oldestKey !== undefined) {
      singleMetadataCache.delete(oldestKey);
    }
  }
}

function parseRawFontItem(raw: RawFontsourceItem): FontCatalogEntry | null {
  if (typeof raw.id !== 'string' || typeof raw.family !== 'string') {
    return null;
  }

  const id = raw.id.trim().toLowerCase();
  const family = raw.family.trim();
  if (!id || !family) {
    return null;
  }

  const rawWeights = Array.isArray(raw.weights)
    ? raw.weights.filter((w): w is number => typeof w === 'number' && w >= 100 && w <= 900)
    : [];
  const weights = rawWeights.length > 0 ? rawWeights : [400, 700];

  const subsets = Array.isArray(raw.subsets)
    ? raw.subsets.filter((s): s is string => typeof s === 'string')
    : [];
  const defSubset =
    typeof raw.defSubset === 'string' && raw.defSubset.trim()
      ? raw.defSubset.trim()
      : subsets.includes('latin')
        ? 'latin'
        : subsets[0] || 'latin';

  const curated = getCuratedFontById(id) ?? getCuratedFontByFamily(family);

  return {
    id,
    family: curated?.family ?? family,
    category: normalizeFontCategory(typeof raw.category === 'string' ? raw.category : undefined),
    weights,
    defSubset,
    bundled: curated?.bundled,
    featured: curated?.featured,
    badge: curated?.badge,
  };
}

function mergeCatalogWithCurated(remoteEntries: FontCatalogEntry[]): FontCatalogEntry[] {
  const byId = new Map<string, FontCatalogEntry>();

  // Keep curated fonts first so featured developer fonts preserve order when query is empty
  for (const curated of CURATED_FONTS) {
    byId.set(curated.id, { ...curated });
  }

  for (const remote of remoteEntries) {
    const existing = byId.get(remote.id);
    if (existing) {
      byId.set(remote.id, {
        ...remote,
        bundled: existing.bundled,
        featured: existing.featured,
        badge: existing.badge,
      });
    } else {
      byId.set(remote.id, remote);
    }
  }

  return Array.from(byId.values());
}

/**
 * Fetches and caches the full Fontsource open-source catalog (~1,600+ families),
 * degrading gracefully to built-in curated fonts if offline or rate-limited.
 */
export async function getFullFontCatalog(): Promise<{
  entries: FontCatalogEntry[];
  source: 'fontsource' | 'curated-fallback';
}> {
  const now = performance.now();
  if (catalogCache && now < catalogCache.expiresAtMs) {
    return { entries: catalogCache.entries, source: 'fontsource' };
  }

  if (!isAllowedFontUrl(FONTSOURCE_CATALOG_URL)) {
    return { entries: [...CURATED_FONTS], source: 'curated-fallback' };
  }

  if (!inflightCatalogPromise) {
    inflightCatalogPromise = (async () => {
      const response = await fetch(FONTSOURCE_CATALOG_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Fontsource catalog HTTP ${response.status}`);
      }

      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) {
        throw new Error('Unexpected Fontsource catalog response format');
      }

      const parsed: FontCatalogEntry[] = [];
      for (const item of payload) {
        if (item && typeof item === 'object') {
          const entry = parseRawFontItem(item as RawFontsourceItem);
          if (entry) parsed.push(entry);
        }
      }

      const merged = mergeCatalogWithCurated(parsed);
      catalogCache = {
        entries: merged,
        expiresAtMs: performance.now() + CATALOG_TTL_MS,
      };
      return merged;
    })().finally(() => {
      inflightCatalogPromise = null;
    });
  }

  try {
    const entries = await inflightCatalogPromise;
    return { entries, source: 'fontsource' };
  } catch {
    return { entries: [...CURATED_FONTS], source: 'curated-fallback' };
  }
}

export async function searchFontCatalog(options: {
  role?: FontRole;
  query?: string;
  limit?: number;
}): Promise<{
  fonts: FontCatalogEntry[];
  totalCatalogSize: number;
  source: 'fontsource' | 'curated-fallback';
}> {
  const { entries, source } = await getFullFontCatalog();
  const fonts = filterFontCatalog(entries, options);
  return {
    fonts,
    totalCatalogSize: entries.length,
    source,
  };
}

/**
 * Resolves metadata for a single font family so Satori and client loaders know its exact
 * Fontsource ID, subset, and available weights without fetching the full 540 KB catalog.
 */
export async function resolveFontMetadata(family: string): Promise<FontCatalogEntry | null> {
  const curated = getCuratedFontByFamily(family);
  if (curated) {
    return curated;
  }

  const slug = familyToFontsourceId(family);
  if (!slug) {
    return null;
  }

  const curatedBySlug = getCuratedFontById(slug);
  if (curatedBySlug) {
    return curatedBySlug;
  }

  if (catalogCache && performance.now() < catalogCache.expiresAtMs) {
    const fromCatalog = catalogCache.entries.find(
      (item) => item.id === slug || item.family.toLowerCase() === family.trim().toLowerCase()
    );
    if (fromCatalog) {
      return fromCatalog;
    }
  }

  if (singleMetadataCache.has(slug)) {
    return singleMetadataCache.get(slug) ?? null;
  }

  const detailUrl = `${FONTSOURCE_CATALOG_URL}/${slug}`;
  if (!isAllowedFontUrl(detailUrl)) {
    return null;
  }

  try {
    const res = await fetch(detailUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      setSingleMetadataCache(slug, null);
      return null;
    }

    const raw: unknown = await res.json();
    if (!raw || typeof raw !== 'object') {
      setSingleMetadataCache(slug, null);
      return null;
    }

    const parsed = parseRawFontItem(raw as RawFontsourceItem);
    setSingleMetadataCache(slug, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function resetFontCatalogCacheForTesting(): void {
  catalogCache = null;
  inflightCatalogPromise = null;
  singleMetadataCache.clear();
}
