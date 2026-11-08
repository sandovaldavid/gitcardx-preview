import React from 'react';

export type MetricType = 'stars' | 'forks' | 'release' | 'license';

interface MetricPillProps {
  type: MetricType;
  value: string | number;
  textColor: string;
  borderColor: string;
  accentColor: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

export const MetricPill: React.FC<MetricPillProps> = ({
  type,
  value,
  textColor,
  borderColor,
  accentColor,
}) => {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 14,
        paddingRight: 16,
        paddingTop: 6,
        paddingBottom: 6,
        borderRadius: 9999,
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        fontSize: 16,
        fontWeight: 500,
        color: textColor,
      }}
    >
      {type === 'stars' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={accentColor}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}

      {type === 'forks' && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={textColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      )}

      {type === 'release' && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )}

      {type === 'license' && (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={textColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )}

      <span>{displayValue}</span>
    </div>
  );
};
