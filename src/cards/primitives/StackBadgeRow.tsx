import React from 'react';
import type { TechStackItem } from '@/core/domain/stackMapper';

interface StackBadgeRowProps {
  items: TechStackItem[];
  textColor: string;
  borderColor: string;
}

export const StackBadgeRow: React.FC<StackBadgeRowProps> = ({ items, textColor, borderColor }) => {
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
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: item.color || '#3b82f6',
            }}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
};
