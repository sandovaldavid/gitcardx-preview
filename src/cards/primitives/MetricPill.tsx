import React from 'react';
import { colord } from 'colord';
import { MetricIcon, MetricType } from '../icons/metricIcons';
import { formatCompactMetric } from './formatters';

export type { MetricType };

interface MetricPillProps {
  type: MetricType;
  value: string | number | null | undefined;
  textColor: string;
  borderColor: string;
  accentColor: string;
  label?: string;
}

export const MetricPill: React.FC<MetricPillProps> = ({
  type,
  value,
  textColor,
  borderColor,
  accentColor,
  label,
}) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const displayValue = typeof value === 'number' ? formatCompactMetric(value) : value;
  const isLightMode = colord(textColor).isDark();
  const pillBg = isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)';

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
        backgroundColor: pillBg,
        fontSize: 19,
        fontWeight: 700,
        color: textColor,
        letterSpacing: '-0.01em',
      }}
    >
      <MetricIcon type={type} textColor={textColor} accentColor={accentColor} size={22} />
      <span>{displayValue}</span>
      {label && <span style={{ opacity: 0.7, fontWeight: 500, fontSize: 16 }}>{label}</span>}
    </div>
  );
};
