import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  buildFontsourceFaceCss,
  familyToFontsourceId,
  filterFontCatalog,
  CURATED_FONTS,
  sanitizeFontFamily,
  selectWeightsForFont,
} from '@/cards/fonts/fontCatalog';
import { resetFontCatalogCacheForTesting } from '@/cards/fonts/fontCatalogService';
import {
  getCardFonts,
  isValidSatoriFontBuffer,
  resetFontLoaderCacheForTesting,
} from '@/cards/fonts/fontLoader';
import { GET as getFontsRoute } from '@/app/api/fonts/route';
import { CARD_TEMPLATES, CardRenderer } from '@/cards/templates/CardTemplateRegistry';
import { DEFAULT_CONFIG, DEFAULT_REPO, useCardStore } from '@/studio/state/useCardStore';
import { FontPicker } from '@/studio/components/FontPicker';
import { ExportModal } from '@/studio/components/ExportModal';
import { FONT_PAIRING_PRESETS } from '@/cards/fonts/fontCatalog';
import type { CardConfig, TemplateId } from '@/core/domain/schemas';

function createMockFontBuffer(magic: number, byteLength = 128, markerByte = 0x42): ArrayBuffer {
  const buf = new ArrayBuffer(byteLength);
  const view = new DataView(buf);
  view.setUint32(0, magic, false);
  view.setUint8(16, markerByte);
  return buf;
}

describe('Dynamic Fonts Catalog, Satori Binary Loader & Studio Picker', () => {
  beforeEach(() => {
    resetFontCatalogCacheForTesting();
    resetFontLoaderCacheForTesting();
    useCardStore.setState({
      repo: DEFAULT_REPO,
      config: DEFAULT_CONFIG,
      isExportModalOpen: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sanitizes font family names against CSS/URL injection and normalizes slugs', () => {
    expect(sanitizeFontFamily('Space Grotesk', 'Inter')).toBe('Space Grotesk');
    expect(sanitizeFontFamily('  Outfit  ', 'Inter')).toBe('Outfit');
    expect(sanitizeFontFamily("Inter'; background:url(evil);//", 'Inter')).toBe('Inter');
    expect(sanitizeFontFamily('../../../etc/passwd', 'JetBrains Mono')).toBe('JetBrains Mono');

    expect(familyToFontsourceId('Plus Jakarta Sans')).toBe('plus-jakarta-sans');
    expect(familyToFontsourceId('M PLUS 1 Code')).toBe('m-plus-1-code');
    expect(familyToFontsourceId('')).toBeNull();
  });

  it('builds valid WOFF2/WOFF @font-face rules and selects available weights', () => {
    expect(selectWeightsForFont([300, 400, 700, 900])).toEqual([400, 700]);
    expect(selectWeightsForFont([400])).toEqual([400]);

    const css = buildFontsourceFaceCss({
      id: 'space-grotesk',
      family: 'Space Grotesk',
      weights: [400, 700],
      defSubset: 'latin',
    });
    expect(css).toContain("font-family:'Space Grotesk'");
    expect(css).toContain(
      'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-400-normal.woff2'
    );
    expect(css).toContain(
      'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.woff2'
    );
  });

  it('validates OpenType/TrueType/WOFF1 signatures and rejects WOFF2 or HTML error bodies', () => {
    const ttf = createMockFontBuffer(0x00010000);
    const otf = createMockFontBuffer(0x4f54544f); // 'OTTO'
    const woff1 = createMockFontBuffer(0x774f4646); // 'wOFF'
    const woff2 = createMockFontBuffer(0x774f4632); // 'wOF2' - unsupported by Satori!
    const htmlError = new TextEncoder().encode('<!DOCTYPE html><html>404 Not Found</html>').buffer;

    expect(isValidSatoriFontBuffer(ttf)).toBe(true);
    expect(isValidSatoriFontBuffer(otf)).toBe(true);
    expect(isValidSatoriFontBuffer(woff1)).toBe(true);
    expect(isValidSatoriFontBuffer(woff2)).toBe(false);
    expect(isValidSatoriFontBuffer(htmlError)).toBe(false);
  });

  it('fetches distinct real TTF/WOFF1 binaries for custom fonts, caches them in LRU, and rejects WOFF2', async () => {
    const mockTtf400 = createMockFontBuffer(0x00010000, 256, 0xaa);
    const mockWoff700 = createMockFontBuffer(0x774f4646, 256, 0xbb);
    const invalidWoff2 = createMockFontBuffer(0x774f4632, 256, 0xcc);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('space-mono@latest/latin-400-normal.ttf')) {
        return new Response(mockTtf400, { status: 200 });
      }
      // Simulate .ttf returning invalid WOFF2 bytes so loader falls back to .woff (WOFF1)
      if (url.endsWith('space-mono@latest/latin-700-normal.ttf')) {
        return new Response(invalidWoff2, { status: 200 });
      }
      if (url.endsWith('space-mono@latest/latin-700-normal.woff')) {
        return new Response(mockWoff700, { status: 200 });
      }
      return new Response('Not Found', { status: 404 });
    });

    const defaultFonts = await getCardFonts({
      fontHeading: 'Inter',
      fontMono: 'JetBrains Mono',
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    const interBuffer = defaultFonts.find((f) => f.name === 'Inter' && f.weight === 400)!.data;
    const jbBuffer = defaultFonts.find(
      (f) => f.name === 'JetBrains Mono' && f.weight === 400
    )!.data;

    const customFonts = await getCardFonts({
      fontHeading: 'Inter',
      fontMono: 'Space Mono',
    });

    const spaceMono400 = customFonts.find((f) => f.name === 'Space Mono' && f.weight === 400);
    const spaceMono700 = customFonts.find((f) => f.name === 'Space Mono' && f.weight === 700);
    expect(spaceMono400).toBeDefined();
    expect(spaceMono700).toBeDefined();
    // Prove Space Mono uses its real fetched binary and NOT aliased Inter/JetBrains Mono!
    expect(spaceMono400!.data).not.toBe(interBuffer);
    expect(spaceMono400!.data).not.toBe(jbBuffer);
    expect(new DataView(spaceMono400!.data).getUint8(16)).toBe(0xaa);
    expect(new DataView(spaceMono700!.data).getUint8(16)).toBe(0xbb);

    const callCountAfterFirstLoad = fetchSpy.mock.calls.length;
    expect(callCountAfterFirstLoad).toBeGreaterThan(0);

    // Second call hits in-memory LRU cache with zero network requests
    await getCardFonts({ fontHeading: 'Inter', fontMono: 'Space Mono' });
    expect(fetchSpy.mock.calls.length).toBe(callCountAfterFirstLoad);
  });

  it('falls back gracefully to bundled fonts when offline so Satori never crashes', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'));

    const fonts = await getCardFonts({
      fontHeading: 'Bricolage Grotesque',
      fontMono: 'Fira Code',
    });

    expect(fonts.some((f) => f.name === 'Bricolage Grotesque' && f.weight === 400)).toBe(true);
    expect(fonts.some((f) => f.name === 'Fira Code' && f.weight === 700)).toBe(true);
  });

  it('serves searchable /api/fonts catalog from Fontsource API and degrades to curated fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            id: 'chakra-petch',
            family: 'Chakra Petch',
            category: 'sans-serif',
            weights: [400, 600, 700],
            defSubset: 'latin',
          },
          {
            id: 'commit-mono',
            family: 'Commit Mono',
            category: 'monospace',
            weights: [400, 700],
            defSubset: 'latin',
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const headingReq = new NextRequest('https://gitframe.dev/api/fonts?role=heading&q=chakra');
    const headingRes = await getFontsRoute(headingReq);
    expect(headingRes.status).toBe(200);
    const headingJson = await headingRes.json();
    expect(headingJson.source).toBe('fontsource');
    expect(headingJson.fonts.some((f: { family: string }) => f.family === 'Chakra Petch')).toBe(
      true
    );
    expect(headingJson.fonts.some((f: { family: string }) => f.family === 'Commit Mono')).toBe(
      false
    );

    // Verify local filter ranking
    const ranked = filterFontCatalog(CURATED_FONTS, { role: 'mono', query: 'geist' });
    expect(ranked[0]?.family).toBe('Geist Mono');
  });

  it('applies both fontHeading and fontMono across all 8 card templates', () => {
    const repoWithAllMetrics = {
      ...DEFAULT_REPO,
      stars: 4200,
      forks: 310,
      latestRelease: { tag: 'v2.4.0', publishedAt: '2026-11-01T00:00:00Z' },
    };

    const templateIds = Object.keys(CARD_TEMPLATES) as TemplateId[];
    expect(templateIds.length).toBe(8);

    for (const templateId of templateIds) {
      const customConfig: CardConfig = {
        ...DEFAULT_CONFIG,
        templateId,
        typography: {
          fontHeading: 'Outfit',
          fontMono: 'Space Mono',
        },
      };

      const html = renderToStaticMarkup(
        <CardRenderer repo={repoWithAllMetrics} config={customConfig} />
      );
      expect(html, `Template ${templateId} should apply fontHeading`).toContain('Outfit');
      expect(html, `Template ${templateId} should apply fontMono`).toContain('Space Mono');
    }
  });

  it('renders FontPicker specimens and validates curated pairing presets', () => {
    expect(FONT_PAIRING_PRESETS.length).toBeGreaterThanOrEqual(5);

    const headingPickerHtml = renderToStaticMarkup(
      <FontPicker
        label="Heading / Display Font"
        role="heading"
        value="Outfit"
        onChange={() => {}}
      />
    );
    const monoPickerHtml = renderToStaticMarkup(
      <FontPicker
        label="Monospace / Code Font"
        role="mono"
        value="JetBrains Mono"
        onChange={() => {}}
      />
    );

    expect(headingPickerHtml).toContain('data-testid="font-picker-trigger-heading"');
    expect(headingPickerHtml).toContain('Outfit');
    expect(headingPickerHtml).toContain('Auto-loaded API');

    expect(monoPickerHtml).toContain('data-testid="font-picker-trigger-mono"');
    expect(monoPickerHtml).toContain('JetBrains Mono');
    expect(monoPickerHtml).toContain('Bundled local');

    // Verify default ExportModal SSR snapshot stays clean
    const cleanExportHtml = renderToStaticMarkup(<ExportModal />);
    expect(cleanExportHtml).toBe('');
  });
});
