import React from 'react';

/**
 * High-visibility Safe Zone Guides overlay (1280x640).
 * Overlays on top of all card elements (zIndex: 9999) with pointerEvents: none.
 * Clearly demarcates the 40px outer social crop danger margin (1200x560 live safe area)
 * and center crosshair alignment guides.
 */
export const SafeZoneGuides: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1280,
        height: 640,
        pointerEvents: 'none',
        display: 'flex',
        zIndex: 9999,
      }}
    >
      {/* Outer 40px Crop Danger Masks (Top, Bottom, Left, Right) */}
      {/* Top Danger Strip (0 to 40px) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1280,
          height: 40,
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
        }}
      />
      {/* Bottom Danger Strip (600 to 640px) */}
      <div
        style={{
          position: 'absolute',
          top: 600,
          left: 0,
          width: 1280,
          height: 40,
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderTop: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
        }}
      />
      {/* Left Danger Strip (0 to 40px) */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 0,
          width: 40,
          height: 560,
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderRight: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
        }}
      />
      {/* Right Danger Strip (1240 to 1280px) */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 1240,
          width: 40,
          height: 560,
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderLeft: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
        }}
      />

      {/* Center Crosshair Alignment Guides */}
      {/* Horizontal Center Line */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 40,
          width: 1200,
          height: 1,
          borderTop: '1px dashed rgba(59, 130, 246, 0.35)',
          display: 'flex',
        }}
      />
      {/* Vertical Center Line */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 640,
          width: 1,
          height: 560,
          borderLeft: '1px dashed rgba(59, 130, 246, 0.35)',
          display: 'flex',
        }}
      />
      {/* Center Target Crosshair Marker */}
      <div
        style={{
          position: 'absolute',
          top: 312,
          left: 632,
          width: 16,
          height: 16,
          border: '1.5px solid rgba(59, 130, 246, 0.7)',
          borderRadius: 8,
          display: 'flex',
        }}
      />

      {/* 40px Safe Zone Box (1200 x 560px) */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          width: 1200,
          height: 560,
          border: '2px dashed rgba(59, 130, 246, 0.85)',
          borderRadius: 12,
          display: 'flex',
          boxShadow: '0 0 12px rgba(59, 130, 246, 0.25)',
        }}
      >
        {/* Corner Bracket: Top-Left */}
        <div
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            width: 24,
            height: 24,
            borderTop: '3px solid #60a5fa',
            borderLeft: '3px solid #60a5fa',
            borderTopLeftRadius: 10,
            display: 'flex',
          }}
        />
        {/* Corner Bracket: Top-Right */}
        <div
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 24,
            height: 24,
            borderTop: '3px solid #60a5fa',
            borderRight: '3px solid #60a5fa',
            borderTopRightRadius: 10,
            display: 'flex',
          }}
        />
        {/* Corner Bracket: Bottom-Left */}
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            left: -2,
            width: 24,
            height: 24,
            borderBottom: '3px solid #60a5fa',
            borderLeft: '3px solid #60a5fa',
            borderBottomLeftRadius: 10,
            display: 'flex',
          }}
        />
        {/* Corner Bracket: Bottom-Right */}
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 24,
            height: 24,
            borderBottom: '3px solid #60a5fa',
            borderRight: '3px solid #60a5fa',
            borderBottomRightRadius: 10,
            display: 'flex',
          }}
        />

        {/* Top-Left Safe Zone Badge */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(59, 130, 246, 0.6)',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 4,
            paddingBottom: 4,
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#3b82f6',
              display: 'flex',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              fontWeight: 700,
              color: '#93c5fd',
              letterSpacing: '0.02em',
            }}
          >
            40px SAFE ZONE · 1200×560px FEED SAFE
          </span>
        </div>

        {/* Top-Right Crop Danger Badge */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(24, 15, 15, 0.92)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 4,
            paddingBottom: 4,
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#ef4444',
              display: 'flex',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'JetBrains Mono',
              fontWeight: 600,
              color: '#fca5a5',
              letterSpacing: '0.02em',
            }}
          >
            OUTER CROP DANGER MARGIN
          </span>
        </div>

        {/* Bottom-Right Dimensions Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 3,
            paddingBottom: 3,
            borderRadius: 4,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono',
              color: '#60a5fa',
              fontWeight: 600,
            }}
          >
            2:1 (1280×640)
          </span>
        </div>
      </div>
    </div>
  );
};
