import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { CardRenderer } from '../templates/CardTemplateRegistry';
import { getCardFonts } from '../fonts/fontLoader';
import type { RepoMetadata, CardConfig } from '@/core/domain/schemas';

export async function renderCardToSvg(repo: RepoMetadata, config: CardConfig): Promise<string> {
  const fonts = await getCardFonts();

  const svg = await satori(<CardRenderer repo={repo} config={config} />, {
    width: 1280,
    height: 640,
    fonts: fonts.map((f) => ({
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
