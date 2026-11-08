import React from 'react';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
}

export const RadialSpotlight: React.FC<BackgroundProps> = ({
  accentColor,
  opacity = 0.5,
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
        <radialGradient
          id="spotlight-primary"
          cx="30%"
          cy="0%"
          r="75%"
          fx="30%"
          fy="0%"
        >
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.5" />
          <stop offset="45%" stopColor={accentColor} stopOpacity="0.18" />
          <stop offset="80%" stopColor={accentColor} stopOpacity="0.04" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="spotlight-corner"
          cx="90%"
          cy="100%"
          r="60%"
        >
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1280" height="640" fill="url(#spotlight-primary)" />
      <rect width="1280" height="640" fill="url(#spotlight-corner)" />
    </svg>
  );
};
