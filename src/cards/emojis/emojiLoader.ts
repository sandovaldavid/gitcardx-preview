import { isAllowedEmojiUrl } from '@/core/security/ssrf';

const TWEMOJI_SVG_BASE_URL = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg';
const MAX_EMOJI_CACHE_ENTRIES = 256;
const MAX_NEGATIVE_CACHE_ENTRIES = 128;
const NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000;
const EMOJI_FETCH_TIMEOUT_MS = 3500;
const MAX_EMOJI_SVG_BYTES = 64_000;

const U200D = String.fromCharCode(0x200d);
const VARIATION_SELECTORS_REGEX = /[\uFE0E\uFE0F]/g;
const SAFE_HEX_SEQUENCE_REGEX = /^[0-9a-f]+(?:-[0-9a-f]+)*$/;

const emojiDataUriCache = new Map<string, string>();
const missingEmojiCache = new Map<string, number>();
const inflightEmojiRequests = new Map<string, Promise<string | null>>();

function getCachedEmojiDataUri(key: string): string | undefined {
  const existing = emojiDataUriCache.get(key);
  if (existing !== undefined) {
    emojiDataUriCache.delete(key);
    emojiDataUriCache.set(key, existing);
  }
  return existing;
}

function setCachedEmojiDataUri(key: string, dataUri: string): void {
  if (emojiDataUriCache.has(key)) {
    emojiDataUriCache.delete(key);
  }
  emojiDataUriCache.set(key, dataUri);
  if (emojiDataUriCache.size > MAX_EMOJI_CACHE_ENTRIES) {
    const oldestKey = emojiDataUriCache.keys().next().value;
    if (oldestKey !== undefined) {
      emojiDataUriCache.delete(oldestKey);
    }
  }
}

function isKnownMissingEmoji(key: string): boolean {
  const expiresAt = missingEmojiCache.get(key);
  if (expiresAt === undefined) {
    return false;
  }
  if (performance.now() >= expiresAt) {
    missingEmojiCache.delete(key);
    return false;
  }
  return true;
}

function markMissingEmoji(key: string): void {
  if (missingEmojiCache.has(key)) {
    missingEmojiCache.delete(key);
  }
  missingEmojiCache.set(key, performance.now() + NEGATIVE_CACHE_TTL_MS);
  if (missingEmojiCache.size > MAX_NEGATIVE_CACHE_ENTRIES) {
    const oldestKey = missingEmojiCache.keys().next().value;
    if (oldestKey !== undefined) {
      missingEmojiCache.delete(oldestKey);
    }
  }
}

function toCodePointSequence(text: string): string {
  const points: string[] = [];
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp !== undefined) {
      points.push(cp.toString(16).toLowerCase());
    }
  }
  return points.join('-');
}

/**
 * Generates ordered Twemoji hex filename candidates for a Unicode emoji grapheme cluster.
 *
 * Non-ZWJ emojis strip Variation Selector-16 (U+FE0F), e.g. "❤️" -> ["2764"], "1️⃣" -> ["31-20e3"].
 * ZWJ sequences try the exact sequence first, then a VS16-stripped fallback so both
 * "❤️‍🔥" ("2764-fe0f-200d-1f525") and "👁️‍🗨️" ("1f441-200d-1f5e8") resolve reliably.
 */
export function getEmojiCodeCandidates(segment: string): string[] {
  const trimmed = segment.trim();
  if (!trimmed) {
    return [];
  }

  const hasZwj = trimmed.includes(U200D);
  const primaryRaw = hasZwj ? trimmed : trimmed.replace(VARIATION_SELECTORS_REGEX, '');
  const strippedRaw = trimmed.replace(VARIATION_SELECTORS_REGEX, '');

  const rawCandidates =
    primaryRaw === strippedRaw
      ? [toCodePointSequence(primaryRaw)]
      : [toCodePointSequence(primaryRaw), toCodePointSequence(strippedRaw)];

  return rawCandidates.filter(
    (code, idx, arr) =>
      code.length > 0 &&
      code.length <= 96 &&
      SAFE_HEX_SEQUENCE_REGEX.test(code) &&
      arr.indexOf(code) === idx
  );
}

/**
 * Validates that a fetched Twemoji payload is a bounded, script-free SVG document.
 */
export function isSafeEmojiSvg(svgText: string): boolean {
  if (!svgText || svgText.length > MAX_EMOJI_SVG_BYTES) {
    return false;
  }

  const lower = svgText.toLowerCase();
  if (!lower.includes('<svg') || !lower.includes('</svg>')) {
    return false;
  }

  return (
    !lower.includes('<script') &&
    !lower.includes('javascript:') &&
    !lower.includes('<foreignobject') &&
    !lower.includes('onload=') &&
    !lower.includes('onerror=')
  );
}

async function fetchEmojiSvgCandidate(hexCode: string): Promise<{
  dataUri: string | null;
  notFound: boolean;
}> {
  const url = `${TWEMOJI_SVG_BASE_URL}/${hexCode}.svg`;
  if (!isAllowedEmojiUrl(url)) {
    return { dataUri: null, notFound: true };
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(EMOJI_FETCH_TIMEOUT_MS),
    });

    if (response.status === 404) {
      return { dataUri: null, notFound: true };
    }

    if (!response.ok) {
      return { dataUri: null, notFound: false };
    }

    const svgText = await response.text();
    if (!isSafeEmojiSvg(svgText)) {
      return { dataUri: null, notFound: false };
    }

    const base64 = Buffer.from(svgText, 'utf8').toString('base64');
    return {
      dataUri: `data:image/svg+xml;base64,${base64}`,
      notFound: false,
    };
  } catch {
    return { dataUri: null, notFound: false };
  }
}

/**
 * Resolves a Unicode emoji grapheme cluster to a base64 SVG data URI suitable for both
 * standalone SVG downloads and offline Rust Resvg PNG rasterization.
 */
export async function loadEmojiDataUri(segment: string): Promise<string | null> {
  const candidates = getEmojiCodeCandidates(segment);
  if (candidates.length === 0) {
    return null;
  }

  const cacheKey = candidates[0];
  const cached = getCachedEmojiDataUri(cacheKey);
  if (cached) {
    return cached;
  }

  if (isKnownMissingEmoji(cacheKey)) {
    return null;
  }

  const inflight = inflightEmojiRequests.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const requestPromise = (async () => {
    let allNotFound = true;

    for (const hexCode of candidates) {
      const { dataUri, notFound } = await fetchEmojiSvgCandidate(hexCode);
      if (dataUri) {
        setCachedEmojiDataUri(cacheKey, dataUri);
        return dataUri;
      }
      if (!notFound) {
        allNotFound = false;
      }
    }

    if (allNotFound) {
      markMissingEmoji(cacheKey);
    }

    return null;
  })();

  inflightEmojiRequests.set(cacheKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inflightEmojiRequests.delete(cacheKey);
  }
}

/**
 * Satori `loadAdditionalAsset` adapter: resolves emoji graphemes to inline base64 SVG data URIs
 * and fails open with an empty font list when offline or for unsupported asset categories.
 */
export async function loadSatoriAdditionalAsset(
  languageCode: string,
  segment: string
): Promise<string | []> {
  if (languageCode !== 'emoji') {
    return [];
  }

  const dataUri = await loadEmojiDataUri(segment);
  return dataUri ?? [];
}

export function resetEmojiCacheForTesting(): void {
  emojiDataUriCache.clear();
  missingEmojiCache.clear();
  inflightEmojiRequests.clear();
}
