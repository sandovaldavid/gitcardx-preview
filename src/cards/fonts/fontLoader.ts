import fs from 'node:fs/promises';
import path from 'node:path';
import { isAllowedFontUrl } from '@/core/security/ssrf';
import {
  buildFontsourceBinaryUrl,
  DEFAULT_HEADING_FONT,
  DEFAULT_MONO_FONT,
  sanitizeFontFamily,
  selectWeightsForFont,
  type SupportedFontWeight,
} from './fontCatalog';
import { resolveFontMetadata } from './fontCatalogService';

export interface CardFontConfig {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: 'normal' | 'italic';
}

interface LocalBundledBuffers {
  interRegular: ArrayBuffer;
  interBold: ArrayBuffer;
  jbMonoRegular: ArrayBuffer;
  jbMonoBold: ArrayBuffer;
}

const MAX_REMOTE_FONT_BUFFER_CACHE = 64;
const BINARY_FETCH_TIMEOUT_MS = 4500;

let cachedBundledBuffers: LocalBundledBuffers | null = null;
const remoteFontBufferCache = new Map<string, ArrayBuffer>();

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function getCachedBuffer(key: string): ArrayBuffer | undefined {
  const existing = remoteFontBufferCache.get(key);
  if (existing) {
    remoteFontBufferCache.delete(key);
    remoteFontBufferCache.set(key, existing);
  }
  return existing;
}

function setCachedBuffer(key: string, buffer: ArrayBuffer): void {
  if (remoteFontBufferCache.has(key)) {
    remoteFontBufferCache.delete(key);
  }
  remoteFontBufferCache.set(key, buffer);
  if (remoteFontBufferCache.size > MAX_REMOTE_FONT_BUFFER_CACHE) {
    const oldestKey = remoteFontBufferCache.keys().next().value;
    if (oldestKey !== undefined) {
      remoteFontBufferCache.delete(oldestKey);
    }
  }
}

/**
 * Verifies that a binary payload is a Satori-supported OpenType/TrueType/WOFF1 font.
 * Satori's opentype.js parser supports TTF (0x00010000 / 'true'), OTF ('OTTO'), and WOFF1 ('wOFF'),
 * and explicitly does NOT support WOFF2 ('wOF2').
 */
export function isValidSatoriFontBuffer(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 64) {
    return false;
  }

  const view = new DataView(buffer);
  const signature = view.getUint32(0, false);

  return (
    signature === 0x00010000 || // TrueType (.ttf)
    signature === 0x4f54544f || // OpenType CFF ('OTTO' .otf)
    signature === 0x74727565 || // Apple TrueType ('true')
    signature === 0x774f4646 // WOFF 1.0 ('wOFF' .woff)
  );
}

async function loadBundledBuffers(): Promise<LocalBundledBuffers> {
  if (cachedBundledBuffers) {
    return cachedBundledBuffers;
  }

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const [interRegBuf, interBoldBuf, jbMonoRegBuf, jbMonoBoldBuf] = await Promise.all([
    fs.readFile(path.join(fontsDir, 'Inter-Regular.ttf')),
    fs.readFile(path.join(fontsDir, 'Inter-Bold.ttf')),
    fs.readFile(path.join(fontsDir, 'JetBrainsMono-Regular.otf')),
    fs.readFile(path.join(fontsDir, 'JetBrainsMono-Bold.otf')),
  ]);

  cachedBundledBuffers = {
    interRegular: toArrayBuffer(interRegBuf),
    interBold: toArrayBuffer(interBoldBuf),
    jbMonoRegular: toArrayBuffer(jbMonoRegBuf),
    jbMonoBold: toArrayBuffer(jbMonoBoldBuf),
  };

  return cachedBundledBuffers;
}

async function fetchFontWeightBuffer(
  id: string,
  subset: string,
  weight: SupportedFontWeight
): Promise<ArrayBuffer | null> {
  const cacheKey = `${id}:${subset}:${weight}`;
  const cached = getCachedBuffer(cacheKey);
  if (cached) {
    return cached;
  }

  // Prefer .ttf for fastest OpenType parsing in Satori; fall back to WOFF1 (.woff) if .ttf fails
  const extensions: Array<'ttf' | 'woff'> = ['ttf', 'woff'];
  for (const ext of extensions) {
    const url = buildFontsourceBinaryUrl(id, subset, weight, ext);
    if (!isAllowedFontUrl(url)) {
      continue;
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(BINARY_FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      if (!isValidSatoriFontBuffer(arrayBuffer)) {
        continue;
      }

      setCachedBuffer(cacheKey, arrayBuffer);
      return arrayBuffer;
    } catch {
      // Try next format or fall back gracefully
    }
  }

  return null;
}

function buildBundledFamilyConfigs(
  familyName: string,
  role: 'heading' | 'mono',
  bundled: LocalBundledBuffers
): CardFontConfig[] {
  const regular = role === 'mono' ? bundled.jbMonoRegular : bundled.interRegular;
  const bold = role === 'mono' ? bundled.jbMonoBold : bundled.interBold;

  return [
    { name: familyName, data: regular, weight: 400, style: 'normal' },
    { name: familyName, data: bold, weight: 700, style: 'normal' },
  ];
}

async function resolveFamilyFontConfigs(
  rawFamily: string | undefined,
  role: 'heading' | 'mono',
  bundled: LocalBundledBuffers
): Promise<CardFontConfig[]> {
  const defaultFamily = role === 'mono' ? DEFAULT_MONO_FONT : DEFAULT_HEADING_FONT;
  const safeFamily = sanitizeFontFamily(rawFamily, defaultFamily);

  // Zero-network fast path for local bundled defaults
  if (safeFamily.toLowerCase() === 'inter') {
    return buildBundledFamilyConfigs('Inter', 'heading', bundled);
  }
  if (safeFamily.toLowerCase() === 'jetbrains mono') {
    return buildBundledFamilyConfigs('JetBrains Mono', 'mono', bundled);
  }

  const metadata = await resolveFontMetadata(safeFamily);
  if (!metadata) {
    return buildBundledFamilyConfigs(safeFamily, role, bundled);
  }

  const weights = selectWeightsForFont(metadata.weights, false);
  const subset = metadata.defSubset || 'latin';

  const fetched = await Promise.all(
    weights.map(async (weight) => {
      const buffer = await fetchFontWeightBuffer(metadata.id, subset, weight);
      return buffer ? { weight, buffer } : null;
    })
  );

  const validConfigs: CardFontConfig[] = fetched
    .filter((item): item is { weight: SupportedFontWeight; buffer: ArrayBuffer } => item !== null)
    .map((item) => ({
      name: safeFamily,
      data: item.buffer,
      weight: item.weight,
      style: 'normal',
    }));

  if (validConfigs.length === 0) {
    // Offline or upstream unavailable: fall back to bundled binary so Satori export never fails
    return buildBundledFamilyConfigs(safeFamily, role, bundled);
  }

  // Ensure single-weight display/mono fonts (e.g. only 400) still render bold headings in their own typeface
  const hasBold = validConfigs.some((cfg) => cfg.weight >= 700);
  if (!hasBold) {
    const heaviest = validConfigs[validConfigs.length - 1];
    validConfigs.push({
      name: safeFamily,
      data: heaviest.data,
      weight: 700,
      style: 'normal',
    });
  }

  return validConfigs;
}

/**
 * Loads Satori-compatible OpenType/TrueType/WOFF1 binary font buffers for the requested card typography.
 * Defaults ('Inter' and 'JetBrains Mono') resolve from local disk in <1ms; any custom Fontsource
 * family dynamically fetches real .ttf/.woff binaries and caches them in a bounded LRU map.
 */
export async function getCardFonts(typography?: {
  fontHeading?: string;
  fontMono?: string;
}): Promise<CardFontConfig[]> {
  const bundled = await loadBundledBuffers();

  const headingFamily = sanitizeFontFamily(typography?.fontHeading, DEFAULT_HEADING_FONT);
  const monoFamily = sanitizeFontFamily(typography?.fontMono, DEFAULT_MONO_FONT);

  const [headingConfigs, monoConfigs] = await Promise.all([
    resolveFamilyFontConfigs(headingFamily, 'heading', bundled),
    headingFamily.toLowerCase() === monoFamily.toLowerCase()
      ? Promise.resolve<CardFontConfig[]>([])
      : resolveFamilyFontConfigs(monoFamily, 'mono', bundled),
  ]);

  const result: CardFontConfig[] = [...headingConfigs, ...monoConfigs];

  // Always keep base Inter and JetBrains Mono available as ultimate Satori fallback families
  if (!result.some((f) => f.name === 'Inter')) {
    result.push(...buildBundledFamilyConfigs('Inter', 'heading', bundled));
  }
  if (!result.some((f) => f.name === 'JetBrains Mono')) {
    result.push(...buildBundledFamilyConfigs('JetBrains Mono', 'mono', bundled));
  }

  return result;
}

export const loadCardFonts = getCardFonts;

export function resetFontLoaderCacheForTesting(): void {
  remoteFontBufferCache.clear();
}
