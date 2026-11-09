import React from 'react';
import { colord } from 'colord';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
  scale?: number;
}

export const AuroraMesh: React.FC<BackgroundProps> = ({
  accentColor,
  opacity = 0.5,
  scale = 1,
}) => {
  const primary = colord(accentColor).isValid() ? colord(accentColor) : colord('#3b82f6');
  // Secondary color shifted 45 degrees in hue
  const secondary = primary.rotate(45).toHex();
  // Tertiary color shifted -45 degrees in hue
  const tertiary = primary.rotate(-45).toHex();

  const s = Math.max(0.25, Math.min(scale, 4));
  const r1 = `${Math.round(65 * s)}%`;
  const r2 = `${Math.round(60 * s)}%`;
  const r3 = `${Math.round(70 * s)}%`;

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
        <radialGradient id="aurora-blob-1" cx="20%" cy="15%" r={r1}>
          <stop offset="0%" stopColor={primary.toHex()} stopOpacity="0.45" />
          <stop offset="50%" stopColor={primary.toHex()} stopOpacity="0.12" />
          <stop offset="100%" stopColor={primary.toHex()} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aurora-blob-2" cx="80%" cy="30%" r={r2}>
          <stop offset="0%" stopColor={secondary} stopOpacity="0.38" />
          <stop offset="55%" stopColor={secondary} stopOpacity="0.10" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="aurora-blob-3" cx="50%" cy="85%" r={r3}>
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
