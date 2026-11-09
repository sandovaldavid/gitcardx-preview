import React from 'react';
import type { BackgroundProps } from './types';
import { SvgPatternCanvas } from './SvgPatternCanvas';
import { generateAuroraMesh } from './generators/auroraMesh';

export const AuroraMesh: React.FC<BackgroundProps> = ({
  accentColor,
  borderColor,
  opacity = 0.5,
  scale = 1,
  idPrefix,
  className,
  style,
}) => {
  const pattern = generateAuroraMesh({
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
