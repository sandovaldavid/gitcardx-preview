'use client';

import React, { useContext, useEffect } from 'react';
import { StudioHydrationContext, useCardStore } from '../state/useCardStore';
import {
  buildFontsourceFaceCss,
  DEFAULT_HEADING_FONT,
  DEFAULT_MONO_FONT,
  familyToFontsourceId,
  getCuratedFontByFamily,
  sanitizeFontFamily,
  type FontCatalogEntry,
} from '@/cards/fonts/fontCatalog';

const DYNAMIC_STYLE_ELEMENT_ID = 'gitframe-dynamic-fonts';

type FontRuleRecord = {
  css: string;
  fullWeightsLoaded: boolean;
};

const injectedFontRegistry = new Map<string, FontRuleRecord>();

function syncStyleElement(): void {
  if (typeof document === 'undefined') return;

  let styleEl = document.getElementById(DYNAMIC_STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DYNAMIC_STYLE_ELEMENT_ID;
    document.head.appendChild(styleEl);
  }

  const combinedCss = Array.from(injectedFontRegistry.values())
    .map((item) => item.css)
    .filter(Boolean)
    .join('\n');

  if (styleEl.textContent !== combinedCss) {
    styleEl.textContent = combinedCss;
  }
}

/**
 * Registers @font-face declarations in the browser DOM for Fontsource font families.
 * Bundled defaults ('Inter' and 'JetBrains Mono') already have zero-latency local @font-face rules in globals.css.
 */
export function ensureBrowserFontsLoaded(
  entries: ReadonlyArray<Pick<FontCatalogEntry, 'id' | 'family' | 'weights' | 'defSubset'>>,
  previewOnly = false
): void {
  if (typeof document === 'undefined') return;

  let mutated = false;
  for (const entry of entries) {
    const familyLower = entry.family.trim().toLowerCase();
    if (familyLower === 'inter' || familyLower === 'jetbrains mono') {
      continue;
    }

    const existing = injectedFontRegistry.get(entry.id);
    if (existing && (existing.fullWeightsLoaded || previewOnly)) {
      continue;
    }

    const css = buildFontsourceFaceCss(entry, previewOnly);
    if (!css) continue;

    injectedFontRegistry.set(entry.id, {
      css,
      fullWeightsLoaded: !previewOnly,
    });
    mutated = true;
  }

  if (mutated) {
    syncStyleElement();
  }
}

async function ensureFamilyLoadedByName(rawFamily: string): Promise<void> {
  const safeFamily = sanitizeFontFamily(rawFamily, '');
  if (!safeFamily) return;

  const lower = safeFamily.toLowerCase();
  if (lower === 'inter' || lower === 'jetbrains mono') {
    return;
  }

  const curated = getCuratedFontByFamily(safeFamily);
  if (curated) {
    ensureBrowserFontsLoaded([curated], false);
    return;
  }

  const fallbackSlug = familyToFontsourceId(safeFamily);
  if (!fallbackSlug) return;

  const existing = injectedFontRegistry.get(fallbackSlug);
  if (existing?.fullWeightsLoaded) return;

  try {
    const res = await fetch(`/api/fonts?q=${encodeURIComponent(safeFamily)}&limit=5`);
    if (res.ok) {
      const data: unknown = await res.json();
      const fonts =
        data && typeof data === 'object' && Array.isArray((data as { fonts?: unknown }).fonts)
          ? ((data as { fonts: FontCatalogEntry[] }).fonts ?? [])
          : [];
      const exact = fonts.find((f) => f.family.toLowerCase() === lower || f.id === fallbackSlug);
      if (exact) {
        ensureBrowserFontsLoaded([exact], false);
        return;
      }
    }
  } catch {
    // Fall back to standard [400, 700] latin rules if metadata API is unreachable
  }

  ensureBrowserFontsLoaded(
    [
      {
        id: fallbackSlug,
        family: safeFamily,
        weights: [400, 500, 600, 700],
        defSubset: 'latin',
      },
    ],
    false
  );
}

export const StudioFontLoader: React.FC = () => {
  const hydration = useContext(StudioHydrationContext);
  const storeConfig = useCardStore((state) => state.config);
  const activeConfig = hydration?.config ?? storeConfig;

  const fontHeading = activeConfig.typography?.fontHeading || DEFAULT_HEADING_FONT;
  const fontMono = activeConfig.typography?.fontMono || DEFAULT_MONO_FONT;

  useEffect(() => {
    void ensureFamilyLoadedByName(fontHeading);
  }, [fontHeading]);

  useEffect(() => {
    void ensureFamilyLoadedByName(fontMono);
  }, [fontMono]);

  return null;
};
