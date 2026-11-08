import React from 'react';

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
      }}
    >
      {/* 40px margin box */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          border: '1px dashed rgba(59, 130, 246, 0.45)',
          borderRadius: 8,
          display: 'flex',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 6,
            left: 8,
            fontSize: 10,
            fontFamily: 'JetBrains Mono',
            color: '#3b82f6',
            opacity: 0.8,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            paddingLeft: 6,
            paddingRight: 6,
            paddingTop: 2,
            paddingBottom: 2,
            borderRadius: 4,
          }}
        >
          40px Safe Zone
        </span>
      </div>
    </div>
  );
};
