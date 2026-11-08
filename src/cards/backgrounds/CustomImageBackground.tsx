import React from 'react';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
  imageUrl?: string;
}

export const CustomImageBackground: React.FC<BackgroundProps> = ({
  accentColor,
  opacity = 0.35,
  imageUrl,
}) => {
  if (imageUrl) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1280,
          height: 640,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity,
          pointerEvents: 'none',
        }}
      />
    );
  }

  // Fallback: subtle dynamic diagonal rays
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
        <linearGradient id="ray-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
          <stop offset="60%" stopColor={accentColor} stopOpacity="0.05" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="0,0 600,0 200,640 0,640" fill="url(#ray-grad)" />
      <polygon points="400,0 1000,0 600,640 200,640" fill="url(#ray-grad)" opacity="0.6" />
      <polygon points="800,0 1280,0 1000,640 600,640" fill="url(#ray-grad)" opacity="0.3" />
    </svg>
  );
};
