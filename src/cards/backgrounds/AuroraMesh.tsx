import React from 'react';
import { colord } from 'colord';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
}

export const AuroraMesh: React.FC<BackgroundProps> = ({
  accentColor,
  opacity = 0.5,
}) => {
  const primary = colord(accentColor).isValid() ? colord(accentColor) : colord('#3b82f6');
  // Secondary color shifted 45 degrees in hue
  const secondary = primary.rotate(45).toHex();
  // Tertiary color shifted -45 degrees in hue
  const tertiary = primary.rotate(-45).toHex();

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
        <radialGradient id="aurora-blob-1" cx="20%" cy="15%" r="65%">
          <stop offset="0%" stopColor={primary.toHex()} stopOpacity="0.45" />
          <stop offset="50%" stopColor={primary.toHex()} stopOpacity="0.12" />
          <stop offset="100%" stopColor={primary.toHex()} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aurora-blob-2" cx="80%" cy="30%" r="60%">
          <stop offset="0%" stopColor={secondary} stopOpacity="0.38" />
          <stop offset="55%" stopColor={secondary} stopOpacity="0.10" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aurora-blob-3" cx="50%" cy="85%" r="70%">
          <stop offset="0%" stopColor={tertiary} stopOpacity="0.30" />
          <stop offset="60%" stopColor={tertiary} stopOpacity="0.08" />
          <stop offset="100%" stopColor={tertiary} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1280" height="640" fill="url(#aurora-blob-1)" />
      <rect width="1280" height="640" fill="url(#aurora-blob-2)" />
      <rect width="1280" height="640" fill="url(#aurora-blob-3)" />
    </svg>
  );
};
