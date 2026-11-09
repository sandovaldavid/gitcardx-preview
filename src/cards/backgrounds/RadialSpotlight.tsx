import React from 'react';
import type { BackgroundProps } from './types';
import { SvgPatternCanvas } from './SvgPatternCanvas';
import { generateRadialSpotlight } from './generators/radialSpotlight';

export const RadialSpotlight: React.FC<BackgroundProps> = ({
  accentColor,
  borderColor,
  opacity = 0.5,
  scale = 1,
  idPrefix,
  className,
  style,
}) => {
  const pattern = generateRadialSpotlight({
    accentColor,
    borderColor,
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
