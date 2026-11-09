import React from 'react';
import type { PatternGeneratorOptions, SvgPatternDefinition } from '../types';

export function calculateRadialSpotlightMetrics(scale: number = 1) {
  const s = Math.max(0.25, Math.min(scale, 4));
  const rPrimary = `${Math.round(75 * s)}%`;
  const rCorner = `${Math.round(60 * s)}%`;
  return { scale: s, rPrimary, rCorner };
}

export function generateRadialSpotlight(options: PatternGeneratorOptions): SvgPatternDefinition {
  const { accentColor, scale = 1, idPrefix, width = 1280, height = 640 } = options;
  const { rPrimary, rCorner } = calculateRadialSpotlightMetrics(scale);

  const prefix = idPrefix ? `${idPrefix}-` : '';
  const primaryId = idPrefix ? `${prefix}spotlight-primary` : 'spotlight-primary';
  const cornerId = idPrefix ? `${prefix}spotlight-corner` : 'spotlight-corner';

  const defs = (
    <defs>
      <radialGradient id={primaryId} cx="30%" cy="0%" r={rPrimary} fx="30%" fy="0%">
        <stop offset="0%" stopColor={accentColor} stopOpacity="0.5" />
        <stop offset="45%" stopColor={accentColor} stopOpacity="0.18" />
        <stop offset="80%" stopColor={accentColor} stopOpacity="0.04" />
        <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={cornerId} cx="90%" cy="100%" r={rCorner}>
        <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
        <stop offset="70%" stopColor={accentColor} stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  const content = (
    <>
      <rect width={width} height={height} fill={`url(#${primaryId})`} />
      <rect width={width} height={height} fill={`url(#${cornerId})`} />
    </>
  );

  const toSvgString = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><radialGradient id="${primaryId}" cx="30%" cy="0%" r="${rPrimary}" fx="30%" fy="0%"><stop offset="0%" stop-color="${accentColor}" stop-opacity="0.5" /><stop offset="45%" stop-color="${accentColor}" stop-opacity="0.18" /><stop offset="80%" stop-color="${accentColor}" stop-opacity="0.04" /><stop offset="100%" stop-color="${accentColor}" stop-opacity="0" /></radialGradient><radialGradient id="${cornerId}" cx="90%" cy="100%" r="${rCorner}"><stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" /><stop offset="70%" stop-color="${accentColor}" stop-opacity="0" /></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#${primaryId})" /><rect width="${width}" height="${height}" fill="url(#${cornerId})" /></svg>`;

  return {
    id: 'radial-spotlight',
    defs,
    content,
    toSvgString,
  };
}
