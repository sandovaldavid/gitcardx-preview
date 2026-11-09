import React from 'react';
import type { BackgroundProps } from './types';
import { SvgPatternCanvas } from './SvgPatternCanvas';
import { generateDotMatrix } from './generators/dotMatrix';

export const DotMatrix: React.FC<BackgroundProps> = ({
  borderColor,
  accentColor,
  opacity = 0.4,
  scale = 1,
  idPrefix,
  className,
  style,
}) => {
  const pattern = generateDotMatrix({
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
