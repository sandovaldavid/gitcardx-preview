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

  switch (pattern.id) {
    case 'architectural-grid':
      return (
        <ArchitecturalGrid accentColor={accentColor} borderColor={borderColor} opacity={opacity} />
      );
    case 'dot-matrix':
      return <DotMatrix accentColor={accentColor} borderColor={borderColor} opacity={opacity} />;
    case 'radial-spotlight':
      return (
        <RadialSpotlight accentColor={accentColor} borderColor={borderColor} opacity={opacity} />
      );
    case 'aurora-mesh':
      return <AuroraMesh accentColor={accentColor} borderColor={borderColor} opacity={opacity} />;
    case 'topographic-contours':
      return (
        <TopographicContours
          accentColor={accentColor}
          borderColor={borderColor}
          opacity={opacity}
        />
      );
    case 'custom-image':
      return (
        <CustomImageBackground
          accentColor={accentColor}
          borderColor={borderColor}
          opacity={opacity}
          imageUrl={customImageUrl}
        />
      );
    default:
      return (
        <ArchitecturalGrid accentColor={accentColor} borderColor={borderColor} opacity={opacity} />
      );
  }
};
