import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { CardRenderer } from '../templates/CardTemplateRegistry';
import { getCardFonts } from '../fonts/fontLoader';
import type { RepoMetadata, CardConfig } from '@/core/domain/schemas';

export async function renderCardToSvg(repo: RepoMetadata, config: CardConfig): Promise<string> {
  const fonts = await getCardFonts();

  const fontList = [...fonts];
  const fontHeading = config.typography?.fontHeading;
  const fontMono = config.typography?.fontMono;

  if (fontHeading && !fontList.some((f) => f.name === fontHeading)) {
    const fallbackReg = fonts.find((f) => f.name === 'Inter' && f.weight === 400);
    const fallbackBold = fonts.find((f) => f.name === 'Inter' && f.weight === 700);
    if (fallbackReg && fallbackBold) {
      fontList.push({ ...fallbackReg, name: fontHeading }, { ...fallbackBold, name: fontHeading });
    }
  }

  if (fontMono && !fontList.some((f) => f.name === fontMono)) {
    const fallbackReg = fonts.find((f) => f.name === 'JetBrains Mono' && f.weight === 400);
    const fallbackBold = fonts.find((f) => f.name === 'JetBrains Mono' && f.weight === 700);
    if (fallbackReg && fallbackBold) {
      fontList.push({ ...fallbackReg, name: fontMono }, { ...fallbackBold, name: fontMono });
    }
  }

  const svg = await satori(<CardRenderer repo={repo} config={config} />, {
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
