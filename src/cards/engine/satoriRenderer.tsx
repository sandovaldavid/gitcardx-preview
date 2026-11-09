import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { CardRenderer } from '../templates/CardTemplateRegistry';
import { getCardFonts } from '../fonts/fontLoader';
import { DEFAULT_HEADING_FONT, DEFAULT_MONO_FONT, sanitizeFontFamily } from '../fonts/fontCatalog';
import type { RepoMetadata, CardConfig } from '@/core/domain/schemas';

export async function renderCardToSvg(repo: RepoMetadata, config: CardConfig): Promise<string> {
  const safeHeading = sanitizeFontFamily(config.typography?.fontHeading, DEFAULT_HEADING_FONT);
  const safeMono = sanitizeFontFamily(config.typography?.fontMono, DEFAULT_MONO_FONT);

  const normalizedConfig: CardConfig = {
    ...config,
    typography: {
      fontHeading: safeHeading,
      fontMono: safeMono,
    },
  };

  const fontList = await getCardFonts(normalizedConfig.typography);

  const svg = await satori(<CardRenderer repo={repo} config={normalizedConfig} />, {
    width: 1280,
    height: 640,
    fonts: fontList.map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight,
      style: f.style,
    })),
  });

  return svg;
}

export async function renderCardToPng(
  repo: RepoMetadata,
  config: CardConfig,
  scale = 1
): Promise<Buffer> {
  const svg = await renderCardToSvg(repo, config);

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'zoom',
      value: scale,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
