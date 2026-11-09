import React from 'react';
import type { PatternGeneratorOptions, SvgPatternDefinition } from '../types';

export function calculateDotMatrixMetrics(scale: number = 1) {
  const s = Math.max(0.25, Math.min(scale, 4));
  const spacing = Math.max(12, Math.round(32 * s));
  const center = Math.round(spacing / 2);
  const r = Math.max(1, Number((1.5 * Math.min(s, 2)).toFixed(1)));
  return { scale: s, spacing, center, r };
}

export function generateDotMatrix(options: PatternGeneratorOptions): SvgPatternDefinition {
  const { borderColor, scale = 1, idPrefix, width = 1280, height = 640 } = options;
  const { spacing, center, r } = calculateDotMatrixMetrics(scale);

  const prefix = idPrefix ? `${idPrefix}-` : '';
  const patternId = idPrefix ? `${prefix}matrix-pattern` : 'dot-matrix-pattern';
  const fadeMaskId = idPrefix ? `${prefix}fade-mask` : 'dot-fade-mask';
  const maskId = idPrefix ? `${prefix}mask` : 'dot-mask';

  const defs = (
    <defs>
      <pattern id={patternId} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
        <circle cx={center} cy={center} r={r} fill={borderColor} />
      </pattern>
      <radialGradient id={fadeMaskId} cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="80%" stopColor="#ffffff" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <mask id={maskId}>
        <rect width={width} height={height} fill={`url(#${fadeMaskId})`} />
      </mask>
    </defs>
  );

  const content = (
    <rect width={width} height={height} fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
  );

  const toSvgString = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><pattern id="${patternId}" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse"><circle cx="${center}" cy="${center}" r="${r}" fill="${borderColor}" /></pattern><radialGradient id="${fadeMaskId}" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#ffffff" stop-opacity="1" /><stop offset="80%" stop-color="#ffffff" stop-opacity="0.3" /><stop offset="100%" stop-color="#ffffff" stop-opacity="0" /></radialGradient><mask id="${maskId}"><rect width="${width}" height="${height}" fill="url(#${fadeMaskId})" /></mask></defs><rect width="${width}" height="${height}" fill="url(#${patternId})" mask="url(#${maskId})" /></svg>`;

  return {
    id: 'dot-matrix',
    defs,
    content,
    toSvgString,
  };
}
