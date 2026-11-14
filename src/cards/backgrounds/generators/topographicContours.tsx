import React from 'react';
import type { PatternGeneratorOptions, SvgPatternDefinition } from '../types';

export const CONTOUR_PATHS = [
  { d: 'M -100 200 C 200 100, 450 350, 750 220 C 1050 90, 1200 280, 1400 210', opacity: 1 },
  { d: 'M -100 260 C 220 160, 470 410, 770 280 C 1070 150, 1220 340, 1400 270', opacity: 0.8 },
  { d: 'M -100 320 C 240 220, 490 470, 790 340 C 1090 210, 1240 400, 1400 330', opacity: 0.6 },
  { d: 'M -100 380 C 260 280, 510 530, 810 400 C 1110 270, 1260 460, 1400 390', opacity: 0.5 },
  { d: 'M -100 440 C 280 340, 530 590, 830 460 C 1130 330, 1280 520, 1400 450', opacity: 0.4 },
  { d: 'M -100 500 C 300 400, 550 650, 850 520 C 1150 390, 1300 580, 1400 510', opacity: 0.3 },
  { d: 'M -100 560 C 320 460, 570 710, 870 580 C 1170 450, 1320 640, 1400 570', opacity: 0.2 },
] as const;

export function calculateTopographicMetrics(scale: number = 1) {
  const s = Math.max(0.25, Math.min(scale, 4));
  const strokeWidth = Number((1.25 * Math.min(s, 2.5)).toFixed(2));
  return { scale: s, strokeWidth };
}

export function generateTopographicContours(
  options: PatternGeneratorOptions
): SvgPatternDefinition {
  const { borderColor, scale = 1, width = 1280, height = 640 } = options;
  const { scale: s, strokeWidth } = calculateTopographicMetrics(scale);
  const cx = width / 2;
  const cy = height / 2;
  // Use explicit SVG center translation because Satori/Resvg ignores CSS transform-origin.
  const transform =
    s === 1 ? undefined : `translate(${cx}, ${cy}) scale(${s}) translate(${-cx}, ${-cy})`;

  const content = (
    <g fill="none" stroke={borderColor} strokeWidth={strokeWidth} transform={transform}>
      {CONTOUR_PATHS.map((path, idx) => (
        <path key={idx} d={path.d} strokeOpacity={path.opacity === 1 ? undefined : path.opacity} />
      ))}
    </g>
  );

  const pathsSvg = CONTOUR_PATHS.map((p) =>
    p.opacity === 1 ? `<path d="${p.d}" />` : `<path d="${p.d}" stroke-opacity="${p.opacity}" />`
  ).join('');
  const transformAttr = transform ? ` transform="${transform}"` : '';

  const toSvgString = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g fill="none" stroke="${borderColor}" stroke-width="${strokeWidth}"${transformAttr}>${pathsSvg}</g></svg>`;

  return {
    id: 'topographic-contours',
    content,
    toSvgString,
  };
}
