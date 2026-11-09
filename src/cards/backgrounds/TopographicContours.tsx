import React from 'react';
import type { BackgroundProps } from './types';
import { SvgPatternCanvas } from './SvgPatternCanvas';
import { generateTopographicContours } from './generators/topographicContours';

export const TopographicContours: React.FC<BackgroundProps> = ({
  borderColor,
  accentColor,
  opacity = 0.35,
  scale = 1,
  idPrefix,
  className,
  style,
}) => {
  const pattern = generateTopographicContours({
    borderColor,
    accentColor,
    scale,
    idPrefix,
  });

  return (
    <SvgPatternCanvas opacity={opacity} className={className} style={style}>
      {pattern.content}
    </SvgPatternCanvas>
  );
};
