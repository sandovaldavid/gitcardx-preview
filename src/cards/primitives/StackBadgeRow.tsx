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
            gap: 8,
            paddingLeft: 12,
            paddingRight: 14,
            paddingTop: 5,
            paddingBottom: 5,
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            fontSize: 14,
            fontWeight: 500,
            color: textColor,
          }}
        >
          <TechIcon
            name={item.name}
            id={item.id}
            color={item.color || '#3b82f6'}
            size={15}
            showOfficialLogo={showOfficialLogos}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
};
