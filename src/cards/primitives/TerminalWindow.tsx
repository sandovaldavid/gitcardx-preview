import React from 'react';
import { colord } from 'colord';

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
  // If outer theme is light (textColor is dark), use an accessible dark slate terminal with bright text
  const isLightMode = colord(textColor).isDark();
  const terminalBg = isLightMode ? '#0f172a' : 'rgba(0, 0, 0, 0.45)';
  const terminalBorder = isLightMode ? '#334155' : borderColor;
  const terminalTextColor = isLightMode ? '#f8fafc' : textColor;
  const terminalTitleColor = isLightMode ? '#94a3b8' : textColor;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        border: `1px solid ${terminalBorder}`,
        backgroundColor: terminalBg,
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
          borderBottom: `1px solid ${terminalBorder}`,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
            color: terminalTitleColor,
            opacity: 0.75,
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
          gap: 12,
          paddingLeft: 18,
          paddingRight: 18,
          paddingTop: 14,
          paddingBottom: 14,
          fontFamily: fontMono,
          fontSize: 17,
        }}
      >
        <span style={{ color: accentColor, fontWeight: 700 }}>$</span>
        <span style={{ color: terminalTextColor, fontWeight: 600 }}>{command}</span>
      </div>
    </div>
  );
};
