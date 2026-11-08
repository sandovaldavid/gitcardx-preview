import React from 'react';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
}

export const ArchitecturalGrid: React.FC<BackgroundProps> = ({
  borderColor,
  opacity = 0.35,
}) => {
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
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke={borderColor}
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />
        </pattern>
        <pattern
          id="arch-large-grid"
          width="160"
          height="160"
          patternUnits="userSpaceOnUse"
        >
          <rect width="160" height="160" fill="url(#arch-small-grid)" />
          <path
            d="M 160 0 L 0 0 0 160"
            fill="none"
            stroke={borderColor}
            strokeWidth="1.5"
            strokeOpacity="0.9"
          />
          {/* Subtle cross ticks at grid intersections */}
          <path
            d="M -6 0 L 6 0 M 0 -6 L 0 6"
            stroke={borderColor}
            strokeWidth="1.5"
          />
        </pattern>
      </defs>

      <rect width="1280" height="640" fill="url(#arch-large-grid)" />
    </svg>
  );
};
