import React from 'react';

interface TerminalWindowProps {
  command: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  title?: string;
  fontMono?: string;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  command,
  textColor,
  borderColor,
  accentColor,
  title = 'bash',
  fontMono = 'JetBrains Mono',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        width: '100%',
        fontFamily: fontMono,
      }}
    >
      {/* Terminal Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 14,
          paddingRight: 14,
          paddingTop: 8,
          paddingBottom: 8,
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#eab308' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e' }} />
        </div>
        <span
          style={{
            fontSize: 12,
            fontFamily: fontMono,
            color: textColor,
            opacity: 0.6,
          }}
        >
          {title}
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Terminal Content Body */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 12,
          paddingBottom: 12,
          fontFamily: fontMono,
          fontSize: 15,
        }}
      >
        <span style={{ color: accentColor, fontWeight: 700 }}>$</span>
        <span style={{ color: textColor, fontWeight: 500 }}>{command}</span>
      </div>
    </div>
  );
};
