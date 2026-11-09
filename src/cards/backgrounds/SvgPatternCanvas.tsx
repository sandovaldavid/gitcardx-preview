import React from 'react';
import type { SvgPatternCanvasProps } from './types';

export const SvgPatternCanvas: React.FC<SvgPatternCanvasProps> = ({
  width = 1280,
  height = 640,
  viewBox = '0 0 1280 640',
  opacity = 1,
  className,
  style,
  children,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: 'none',
        opacity,
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      {children}
    </svg>
  );
};
