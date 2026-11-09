import React from 'react';
import type { BackgroundProps } from './types';
import { SvgPatternCanvas } from './SvgPatternCanvas';
import { generateArchitecturalGrid } from './generators/architecturalGrid';

export const ArchitecturalGrid: React.FC<BackgroundProps> = ({
  borderColor,
  accentColor,
  opacity = 0.35,
  scale = 1,
  idPrefix,
  className,
  style,
}) => {
  const pattern = generateArchitecturalGrid({
    borderColor,
    accentColor,
    scale,
    idPrefix,
  });

  return (
    <SvgPatternCanvas opacity={opacity} className={className} style={style}>
      {pattern.defs}
      {pattern.content}
    </SvgPatternCanvas>
  );
};
