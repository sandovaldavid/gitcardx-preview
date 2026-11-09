import React from 'react';
import { colord } from 'colord';
import type { PatternGeneratorOptions, SvgPatternDefinition } from '../types';

export function calculateAuroraMeshMetrics(accentColor: string, scale: number = 1) {
  const primary = colord(accentColor).isValid() ? colord(accentColor) : colord('#3b82f6');
  const secondary = primary.rotate(45).toHex();
  const tertiary = primary.rotate(-45).toHex();

  const s = Math.max(0.25, Math.min(scale, 4));
  const r1 = `${Math.round(65 * s)}%`;
  const r2 = `${Math.round(60 * s)}%`;
  const r3 = `${Math.round(70 * s)}%`;

  return { primary: primary.toHex(), secondary, tertiary, scale: s, r1, r2, r3 };
}

export function generateAuroraMesh(options: PatternGeneratorOptions): SvgPatternDefinition {
  const { accentColor, scale = 1, idPrefix, width = 1280, height = 640 } = options;
  const { primary, secondary, tertiary, r1, r2, r3 } = calculateAuroraMeshMetrics(
    accentColor,
    scale
  );

  const prefix = idPrefix ? `${idPrefix}-` : '';
  const blob1Id = idPrefix ? `${prefix}aurora-blob-1` : 'aurora-blob-1';
  const blob2Id = idPrefix ? `${prefix}aurora-blob-2` : 'aurora-blob-2';
  const blob3Id = idPrefix ? `${prefix}aurora-blob-3` : 'aurora-blob-3';

  const defs = (
    <defs>
      <radialGradient id={blob1Id} cx="20%" cy="15%" r={r1}>
        <stop offset="0%" stopColor={primary} stopOpacity="0.45" />
        <stop offset="50%" stopColor={primary} stopOpacity="0.12" />
        <stop offset="100%" stopColor={primary} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={blob2Id} cx="80%" cy="30%" r={r2}>
        <stop offset="0%" stopColor={secondary} stopOpacity="0.38" />
        <stop offset="55%" stopColor={secondary} stopOpacity="0.10" />
        <stop offset="100%" stopColor={secondary} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={blob3Id} cx="50%" cy="85%" r={r3}>
        <stop offset="0%" stopColor={tertiary} stopOpacity="0.30" />
        <stop offset="60%" stopColor={tertiary} stopOpacity="0.08" />
        <stop offset="100%" stopColor={tertiary} stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  const content = (
    <>
      <rect width={width} height={height} fill={`url(#${blob1Id})`} />
      <rect width={width} height={height} fill={`url(#${blob2Id})`} />
      <rect width={width} height={height} fill={`url(#${blob3Id})`} />
    </>
  );

  const toSvgString = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><radialGradient id="${blob1Id}" cx="20%" cy="15%" r="${r1}"><stop offset="0%" stop-color="${primary}" stop-opacity="0.45" /><stop offset="50%" stop-color="${primary}" stop-opacity="0.12" /><stop offset="100%" stop-color="${primary}" stop-opacity="0" /></radialGradient><radialGradient id="${blob2Id}" cx="80%" cy="30%" r="${r2}"><stop offset="0%" stop-color="${secondary}" stop-opacity="0.38" /><stop offset="55%" stop-color="${secondary}" stop-opacity="0.10" /><stop offset="100%" stop-color="${secondary}" stop-opacity="0" /></radialGradient><radialGradient id="${blob3Id}" cx="50%" cy="85%" r="${r3}"><stop offset="0%" stop-color="${tertiary}" stop-opacity="0.30" /><stop offset="60%" stop-color="${tertiary}" stop-opacity="0.08" /><stop offset="100%" stop-color="${tertiary}" stop-opacity="0" /></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#${blob1Id})" /><rect width="${width}" height="${height}" fill="url(#${blob2Id})" /><rect width="${width}" height="${height}" fill="url(#${blob3Id})" /></svg>`;

  return {
    id: 'aurora-mesh',
    defs,
    content,
    toSvgString,
  };
}
