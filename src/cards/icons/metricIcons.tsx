import React from 'react';

export type MetricType =
  'stars' | 'forks' | 'release' | 'license' | 'issues' | 'discussions' | 'contributors';

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

export const IssueMetricIcon: React.FC<BaseMetricIconProps> = ({ color, size = 18 }) => (
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
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </svg>
);

export const DiscussionMetricIcon: React.FC<BaseMetricIconProps> = ({ color, size = 18 }) => (
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
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const ContributorMetricIcon: React.FC<BaseMetricIconProps> = ({ color, size = 18 }) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    case 'issues':
      return <IssueMetricIcon color={accentColor} size={size} />;
    case 'discussions':
      return <DiscussionMetricIcon color={accentColor} size={size} />;
    case 'contributors':
      return <ContributorMetricIcon color={textColor} size={size} />;
  }
};
