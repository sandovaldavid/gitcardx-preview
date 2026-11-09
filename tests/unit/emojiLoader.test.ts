import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getEmojiCodeCandidates,
  isSafeEmojiSvg,
  loadEmojiDataUri,
  loadSatoriAdditionalAsset,
  resetEmojiCacheForTesting,
} from '@/cards/emojis/emojiLoader';
import { renderCardToPng, renderCardToSvg } from '@/cards/engine/satoriRenderer';
import type { CardConfig, RepoMetadata } from '@/core/domain/schemas';

const SAMPLE_ROCKET_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#dd2e44"/></svg>';

const mockRepoWithEmojis: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    isOrg: false,
  },
  name: 'portfolio',
  description: '🚀 Modern developer portfolio ✨ crafted with ❤️ and TypeScript 👨‍💻',
  homepageUrl: 'https://sandovaldavid.com',
  stars: 142,
  forks: 18,
  primaryLanguage: {
    name: 'TypeScript',
    color: '#3178C6',
  },
  languages: [{ name: 'TypeScript', color: '#3178C6', size: 100000 }],
  topics: ['nextjs', 'portfolio', 'typescript'],
  license: 'MIT',
  latestRelease: {
    tag: 'v2.4.0',
    publishedAt: '2026-11-01T12:00:00Z',
  },
  contributors: [],
};

const baseConfig: CardConfig = {
  templateId: 'modern-minimal',
  title: '',
  tagline: '',
  installCommand: 'bun dev',
  contentAlign: 'left',
  palette: {
    background: '#0a0a0a',
    text: '#ffffff',
    accent: '#3b82f6',
    border: '#262626',
  },
  typography: {
    fontHeading: 'Inter',
    fontMono: 'JetBrains Mono',
  },
  backgroundPattern: {
    id: 'dot-matrix',
    opacity: 0.25,
  },
  visibility: {
    author: true,
    tagline: true,
    techStack: true,
    languageLogos: true,
    stars: true,
    forks: true,
    release: true,
    license: true,
    contributors: false,
    issues: false,
    discussions: false,
    installCommand: false,
  },
};

describe('emojiLoader & Satori emoji export pipeline', () => {
  beforeEach(() => {
    resetEmojiCacheForTesting();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetEmojiCacheForTesting();
  });

  it('computes canonical Twemoji hex candidates across single, VS16, keycap, flag, skin-tone, and ZWJ emojis', () => {
    expect(getEmojiCodeCandidates('🚀')).toEqual(['1f680']);
    expect(getEmojiCodeCandidates('✨')).toEqual(['2728']);
    expect(getEmojiCodeCandidates('❤️')).toEqual(['2764']);
    expect(getEmojiCodeCandidates('⚙️')).toEqual(['2699']);
    expect(getEmojiCodeCandidates('1️⃣')).toEqual(['31-20e3']);
    expect(getEmojiCodeCandidates('👋🏽')).toEqual(['1f44b-1f3fd']);
    expect(getEmojiCodeCandidates('🇺🇸')).toEqual(['1f1fa-1f1f8']);
    expect(getEmojiCodeCandidates('👨‍💻')).toEqual(['1f468-200d-1f4bb']);
    expect(getEmojiCodeCandidates('❤️‍🔥')).toEqual(['2764-fe0f-200d-1f525', '2764-200d-1f525']);
    expect(getEmojiCodeCandidates('👁️‍🗨️')).toEqual([
      '1f441-fe0f-200d-1f5e8-fe0f',
      '1f441-200d-1f5e8',
    ]);
  });

  it('validates clean emoji SVGs and rejects dangerous markup or oversized payloads', () => {
    expect(isSafeEmojiSvg(SAMPLE_ROCKET_SVG)).toBe(true);
    expect(isSafeEmojiSvg('<svg><script>alert(1)</script></svg>')).toBe(false);
    expect(isSafeEmojiSvg('<svg onload="alert(1)"></svg>')).toBe(false);
    expect(isSafeEmojiSvg('<svg><foreignObject></foreignObject></svg>')).toBe(false);
    expect(isSafeEmojiSvg('<svg>' + 'a'.repeat(70_000) + '</svg>')).toBe(false);
  });

  it('caches resolved base64 SVG data URIs and falls back cleanly to VS16-stripped ZWJ candidates', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/1f441-fe0f-200d-1f5e8-fe0f.svg')) {
        return new Response('Not Found', { status: 404 });
      }
      if (url.endsWith('/1f441-200d-1f5e8.svg')) {
        return new Response(SAMPLE_ROCKET_SVG, { status: 200 });
      }
      return new Response('Not Found', { status: 404 });
    });

    const first = await loadEmojiDataUri('👁️‍🗨️');
    const second = await loadEmojiDataUri('👁️‍🗨️');

    expect(first).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(second).toBe(first);
    // Primary 404 + stripped 200 on first call, 0 network calls on second (LRU cache hit)
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('fails open with an empty array when offline or when Satori requests non-emoji assets', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));

    await expect(loadSatoriAdditionalAsset('ja-JP', '日本語')).resolves.toEqual([]);
    await expect(loadSatoriAdditionalAsset('emoji', '🚀')).resolves.toEqual([]);
  });

  it('embeds inline base64 emoji SVGs in renderCardToSvg and rasterizes them in renderCardToPng', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('twemoji@15.1.0/assets/svg/')) {
        return new Response(SAMPLE_ROCKET_SVG, { status: 200 });
      }
      return new Response('Not Found', { status: 404 });
    });

    const svg = await renderCardToSvg(mockRepoWithEmojis, baseConfig);
    const expectedDataUri = `data:image/svg+xml;base64,${Buffer.from(
      SAMPLE_ROCKET_SVG,
      'utf8'
    ).toString('base64')}`;

    // Verify all 4 description emojis (🚀, ✨, ❤️, 👨‍💻) are embedded as inline SVG data URIs
    const occurrences = svg.split(expectedDataUri).length - 1;
    expect(occurrences).toBe(4);

    const pngWithEmojis = await renderCardToPng(mockRepoWithEmojis, baseConfig, 1);
    expect(pngWithEmojis[0]).toBe(0x89);
    expect(pngWithEmojis[1]).toBe(0x50);
    expect(pngWithEmojis[2]).toBe(0x4e);
    expect(pngWithEmojis[3]).toBe(0x47);

    // Compare against the exact same card when emoji loading is offline: PNG buffers must differ
    resetEmojiCacheForTesting();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline'));
    const pngWithoutEmojis = await renderCardToPng(mockRepoWithEmojis, baseConfig, 1);

    expect(Buffer.compare(pngWithEmojis, pngWithoutEmojis)).not.toBe(0);
  });
});
