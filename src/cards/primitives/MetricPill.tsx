import React from 'react';
import { MetricIcon, MetricType } from '../icons/metricIcons';

export type { MetricType };

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
        gap: 10,
        paddingLeft: 16,
        paddingRight: 18,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 9999,
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        fontSize: 18,
        fontWeight: 600,
        color: textColor,
      }}
    >
      <MetricIcon type={type} textColor={textColor} accentColor={accentColor} size={22} />
      <span>{displayValue}</span>
    </div>
  );
};
