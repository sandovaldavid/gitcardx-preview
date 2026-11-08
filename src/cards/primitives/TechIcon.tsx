import React from 'react';
import { getLanguageLogo, LANGUAGE_LOGOS } from '@/cards/icons/languageLogos';

export { getLanguageLogo, LANGUAGE_LOGOS };

/**
 * Legacy path registry maintained for backwards compatibility.
 * Official vector logos are now resolved via getLanguageLogo() and LANGUAGE_LOGOS.
 */
export const TECH_SVG_PATHS: Record<string, string> = {};

export interface TechIconProps {
  name: string;
  id?: string;
  color?: string;
  size?: number;
  showOfficialLogo?: boolean;
}

export const TechIcon: React.FC<TechIconProps> = ({
  name,
  id,
  color = '#3b82f6',
  size = 14,
  showOfficialLogo = true,
}) => {
  const logo = showOfficialLogo ? getLanguageLogo(id) || getLanguageLogo(name) : null;

  // If official logo flag is disabled or no logo exists, render the clean colored dot
  if (!showOfficialLogo || !logo) {
    return (
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.dataUri}
      alt={name || logo.name}
      width={size}
      height={size}
      style={{
        display: 'flex',
        flexShrink: 0,
      }}
    />
  );
};
