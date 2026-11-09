import React from 'react';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
  scale?: number;
}

export const ArchitecturalGrid: React.FC<BackgroundProps> = ({
  borderColor,
  opacity = 0.35,
  scale = 1,
}) => {
  const s = Math.max(0.25, Math.min(scale, 4));
  const smallSize = Math.max(10, Math.round(40 * s));
  const largeSize = Math.max(40, Math.round(160 * s));

  return (
    <svg
      width="1280"
      height="640"
      viewBox="0 0 1280 640"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1280,
        height: 640,
        pointerEvents: 'none',
        opacity,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="arch-small-grid"
          width={smallSize}
          height={smallSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${smallSize} 0 L 0 0 0 ${smallSize}`}
            fill="none"
            stroke={borderColor}
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />
        </pattern>
        <pattern
          id="arch-large-grid"
          width={largeSize}
          height={largeSize}
          patternUnits="userSpaceOnUse"
        >
          <rect width={largeSize} height={largeSize} fill="url(#arch-small-grid)" />
          <path
            d={`M ${largeSize} 0 L 0 0 0 ${largeSize}`}
            fill="none"
            stroke={borderColor}
            strokeWidth="1.5"
            strokeOpacity="0.9"
          />
          {/* Subtle cross ticks at grid intersections */}
          <path d="M -6 0 L 6 0 M 0 -6 L 0 6" stroke={borderColor} strokeWidth="1.5" />
        </pattern>
      </defs>

      <rect width="1280" height="640" fill="url(#arch-large-grid)" />
    </svg>
  );
};
