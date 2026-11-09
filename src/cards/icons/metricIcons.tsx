import React from 'react';

export type MetricType = 'stars' | 'forks' | 'release' | 'license';

export interface BaseMetricIconProps {
  color: string;
  size?: number;
}

export const StarMetricIcon: React.FC<BaseMetricIconProps> = ({ color, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const ForkMetricIcon: React.FC<BaseMetricIconProps> = ({ color, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

export const ReleaseMetricIcon: React.FC<BaseMetricIconProps> = ({ color, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export const LicenseMetricIcon: React.FC<BaseMetricIconProps> = ({ color, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export interface MetricIconProps {
  type: MetricType;
  textColor: string;
  accentColor: string;
  size?: number;
}

export const MetricIcon: React.FC<MetricIconProps> = ({
  type,
  textColor,
  accentColor,
  size = 18,
}) => {
  switch (type) {
    case 'stars':
      return <StarMetricIcon color={accentColor} size={size} />;
    case 'forks':
      return <ForkMetricIcon color={textColor} size={size} />;
    case 'release':
      return <ReleaseMetricIcon color={accentColor} size={size} />;
    case 'license':
      return <LicenseMetricIcon color={textColor} size={size} />;
  }
};
