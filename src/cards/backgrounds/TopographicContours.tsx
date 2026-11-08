import React from 'react';

interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
}

export const TopographicContours: React.FC<BackgroundProps> = ({
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
      <g fill="none" stroke={borderColor} strokeWidth="1.25">
        <path d="M -100 200 C 200 100, 450 350, 750 220 C 1050 90, 1200 280, 1400 210" />
        <path d="M -100 260 C 220 160, 470 410, 770 280 C 1070 150, 1220 340, 1400 270" strokeOpacity="0.8" />
        <path d="M -100 320 C 240 220, 490 470, 790 340 C 1090 210, 1240 400, 1400 330" strokeOpacity="0.6" />
        <path d="M -100 380 C 260 280, 510 530, 810 400 C 1110 270, 1260 460, 1400 390" strokeOpacity="0.5" />
        <path d="M -100 440 C 280 340, 530 590, 830 460 C 1130 330, 1280 520, 1400 450" strokeOpacity="0.4" />
        <path d="M -100 500 C 300 400, 550 650, 850 520 C 1150 390, 1300 580, 1400 510" strokeOpacity="0.3" />
        <path d="M -100 560 C 320 460, 570 710, 870 580 C 1170 450, 1320 640, 1400 570" strokeOpacity="0.2" />
      </g>
    </svg>
  );
};
