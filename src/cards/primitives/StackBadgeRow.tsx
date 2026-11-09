import React from 'react';
import type { TechStackItem } from '@/core/domain/stackMapper';
import { TechIcon } from './TechIcon';

interface StackBadgeRowProps {
  items: TechStackItem[];
  textColor: string;
  borderColor: string;
  showOfficialLogos?: boolean;
}

export const StackBadgeRow: React.FC<StackBadgeRowProps> = ({
  items,
  textColor,
  borderColor,
  showOfficialLogos = true,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 14,
            paddingRight: 16,
            paddingTop: 7,
            paddingBottom: 7,
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            fontSize: 16,
            fontWeight: 600,
            color: textColor,
          }}
        >
          <TechIcon
            name={item.name}
            id={item.id}
            color={item.color || '#3b82f6'}
            size={20}
            showOfficialLogo={showOfficialLogos}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
};
