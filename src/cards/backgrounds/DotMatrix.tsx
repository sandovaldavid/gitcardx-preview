import React from 'react';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
}

export const DotMatrix: React.FC<BackgroundProps> = ({
  borderColor,
  opacity = 0.4,
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
          id="dot-matrix-pattern"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="16" cy="16" r="1.5" fill={borderColor} />
        </pattern>
        <radialGradient id="dot-fade-mask" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="80%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <mask id="dot-mask">
          <rect width="1280" height="640" fill="url(#dot-fade-mask)" />
        </mask>
      </defs>

      <rect
        width="1280"
        height="640"
        fill="url(#dot-matrix-pattern)"
        mask="url(#dot-mask)"
      />
    </svg>
  );
};
