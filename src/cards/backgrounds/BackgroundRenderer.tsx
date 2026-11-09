import React from 'react';
import type { BackgroundPatternConfig } from '@/core/domain/schemas';
import { ArchitecturalGrid } from './ArchitecturalGrid';
import { DotMatrix } from './DotMatrix';
import { RadialSpotlight } from './RadialSpotlight';
import { AuroraMesh } from './AuroraMesh';
import { TopographicContours } from './TopographicContours';
import { CustomImageBackground } from './CustomImageBackground';

interface BackgroundRendererProps {
  pattern: BackgroundPatternConfig;
  accentColor: string;
  borderColor: string;
  customImageUrl?: string;
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({
  pattern,
  accentColor,
  borderColor,
  customImageUrl,
}) => {
  const opacity = pattern.opacity ?? 0.4;
  const scale = pattern.scale ?? 1;
  const effectiveAccent = pattern.color || accentColor;
  const effectiveBorder = pattern.color || borderColor;

  switch (pattern.id) {
    case 'architectural-grid':
      return (
        <ArchitecturalGrid
          accentColor={effectiveAccent}
          borderColor={effectiveBorder}
          opacity={opacity}
          scale={scale}
        />
      );
    case 'dot-matrix':
      return (
        <DotMatrix
          accentColor={effectiveAccent}
          borderColor={effectiveBorder}
          opacity={opacity}
          scale={scale}
        />
      );
    case 'radial-spotlight':
      return (
        <RadialSpotlight
          accentColor={effectiveAccent}
          borderColor={effectiveBorder}
          opacity={opacity}
          scale={scale}
        />
      );
    case 'aurora-mesh':
      return (
        <AuroraMesh
          accentColor={effectiveAccent}
          borderColor={effectiveBorder}
          opacity={opacity}
          scale={scale}
        />
      );
    case 'topographic-contours':
      return (
        <TopographicContours
          accentColor={effectiveAccent}
          borderColor={effectiveBorder}
          opacity={opacity}
          scale={scale}
        />
      );
    case 'custom-image':
      return (
        <CustomImageBackground
          accentColor={effectiveAccent}
          borderColor={effectiveBorder}
          opacity={opacity}
          imageUrl={customImageUrl}
          scale={scale}
        />
      );
    default:
      return (
        <ArchitecturalGrid
          accentColor={effectiveAccent}
          borderColor={effectiveBorder}
          opacity={opacity}
          scale={scale}
        />
      );
  }
};
