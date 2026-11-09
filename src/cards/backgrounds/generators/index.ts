import type { BackgroundPatternId, PatternGeneratorOptions, SvgPatternDefinition } from '../types';
import { generateArchitecturalGrid, calculateArchitecturalGridMetrics } from './architecturalGrid';
import { generateDotMatrix, calculateDotMatrixMetrics } from './dotMatrix';
import { generateRadialSpotlight, calculateRadialSpotlightMetrics } from './radialSpotlight';
import { generateAuroraMesh, calculateAuroraMeshMetrics } from './auroraMesh';
import {
  generateTopographicContours,
  calculateTopographicMetrics,
  CONTOUR_PATHS,
} from './topographicContours';
import { generateDynamicRays } from './dynamicRays';

export {
  generateArchitecturalGrid,
  calculateArchitecturalGridMetrics,
  generateDotMatrix,
  calculateDotMatrixMetrics,
  generateRadialSpotlight,
  calculateRadialSpotlightMetrics,
  generateAuroraMesh,
  calculateAuroraMeshMetrics,
  generateTopographicContours,
  calculateTopographicMetrics,
  CONTOUR_PATHS,
  generateDynamicRays,
};

export function getPatternDefinition(
  patternId: BackgroundPatternId | 'dynamic-rays',
  options: PatternGeneratorOptions
): SvgPatternDefinition {
  switch (patternId) {
    case 'architectural-grid':
      return generateArchitecturalGrid(options);
    case 'dot-matrix':
      return generateDotMatrix(options);
    case 'radial-spotlight':
      return generateRadialSpotlight(options);
    case 'aurora-mesh':
      return generateAuroraMesh(options);
    case 'topographic-contours':
      return generateTopographicContours(options);
    case 'custom-image':
    case 'dynamic-rays':
      return generateDynamicRays(options);
    default:
      return generateArchitecturalGrid(options);
  }
}

export function getPatternSvgString(
  patternId: BackgroundPatternId | 'dynamic-rays',
  options: PatternGeneratorOptions
): string {
  return getPatternDefinition(patternId, options).toSvgString();
}

export function getPatternDataUri(
  patternId: BackgroundPatternId | 'dynamic-rays',
  options: PatternGeneratorOptions
): string {
  const svg = getPatternSvgString(patternId, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
