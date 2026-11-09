import React from 'react';
import type { PatternGeneratorOptions, SvgPatternDefinition } from '../types';

export function calculateArchitecturalGridMetrics(scale: number = 1) {
  const s = Math.max(0.25, Math.min(scale, 4));
  const smallSize = Math.max(10, Math.round(40 * s));
  const largeSize = Math.max(40, Math.round(160 * s));
  return { scale: s, smallSize, largeSize };
}

export function generateArchitecturalGrid(options: PatternGeneratorOptions): SvgPatternDefinition {
  const { borderColor, scale = 1, idPrefix, width = 1280, height = 640 } = options;
  const { smallSize, largeSize } = calculateArchitecturalGridMetrics(scale);

  const prefix = idPrefix ? `${idPrefix}-` : 'arch-';
  const smallId = `${prefix}small-grid`;
  const largeId = `${prefix}large-grid`;

  const defs = (
    <defs>
      <pattern id={smallId} width={smallSize} height={smallSize} patternUnits="userSpaceOnUse">
        <path
          d={`M ${smallSize} 0 L 0 0 0 ${smallSize}`}
          fill="none"
          stroke={borderColor}
          strokeWidth="0.75"
          strokeOpacity="0.6"
        />
      </pattern>
      <pattern id={largeId} width={largeSize} height={largeSize} patternUnits="userSpaceOnUse">
        <rect width={largeSize} height={largeSize} fill={`url(#${smallId})`} />
        <path
          d={`M ${largeSize} 0 L 0 0 0 ${largeSize}`}
          fill="none"
          stroke={borderColor}
          strokeWidth="1.5"
          strokeOpacity="0.9"
        />
        {/* Subtle cross ticks at grid intersections */}
        <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke={borderColor} strokeWidth="1.5" />
      </pattern>
    </defs>
  );

  const content = <rect width={width} height={height} fill={`url(#${largeId})`} />;

  const toSvgString = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><pattern id="${smallId}" width="${smallSize}" height="${smallSize}" patternUnits="userSpaceOnUse"><path d="M ${smallSize} 0 L 0 0 0 ${smallSize}" fill="none" stroke="${borderColor}" stroke-width="0.75" stroke-opacity="0.6" /></pattern><pattern id="${largeId}" width="${largeSize}" height="${largeSize}" patternUnits="userSpaceOnUse"><rect width="${largeSize}" height="${largeSize}" fill="url(#${smallId})" /><path d="M ${largeSize} 0 L 0 0 0 ${largeSize}" fill="none" stroke="${borderColor}" stroke-width="1.5" stroke-opacity="0.9" /><path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke="${borderColor}" stroke-width="1.5" /></pattern></defs><rect width="${width}" height="${height}" fill="url(#${largeId})" /></svg>`;

  return {
    id: 'architectural-grid',
    defs,
    content,
    toSvgString,
  };
}
