import React from 'react';
import { formatSafeCssUrl } from '@/core/security/ssrf';
import type { CustomImageBackgroundProps } from './types';
import { SvgPatternCanvas } from './SvgPatternCanvas';
import { generateDynamicRays } from './generators/dynamicRays';

export const CustomImageBackground: React.FC<CustomImageBackgroundProps> = ({
  accentColor,
  borderColor,
  opacity = 0.35,
  imageUrl,
  scale = 1,
  idPrefix,
  className,
  style,
}) => {
  const safeBackgroundImage = formatSafeCssUrl(imageUrl);
  if (safeBackgroundImage) {
    const bgSize = scale === 1 ? 'cover' : `${Math.round(100 * scale)}%`;
    return (
      <div
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1280,
          height: 640,
          backgroundImage: safeBackgroundImage,
          backgroundSize: bgSize,
          backgroundPosition: 'center',
          opacity,
          pointerEvents: 'none',
          ...style,
        }}
      />
    );
  }

  // Fallback: subtle dynamic diagonal rays
  const pattern = generateDynamicRays({
    accentColor,
    borderColor,
    idPrefix,
  });

  return (
    <SvgPatternCanvas opacity={opacity} className={className} style={style}>
      {pattern.defs}
      {pattern.content}
    </SvgPatternCanvas>
  );
};
