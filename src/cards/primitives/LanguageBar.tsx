import React from 'react';
import type { RepoLanguageSchema } from '@/core/domain/schemas';
import { z } from 'zod';

type Language = z.infer<typeof RepoLanguageSchema>;

interface LanguageBarProps {
  languages: Language[];
  textColor: string;
  maxLanguages?: number;
}

export const LanguageBar: React.FC<LanguageBarProps> = ({
  languages,
  textColor,
  maxLanguages = 4,
}) => {
  const visible = languages.slice(0, maxLanguages);
  const totalSize = visible.reduce((acc, l) => acc + l.size, 0);

  if (totalSize === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
      }}
    >
      {/* Proportion Bar */}
      <div
        style={{
          display: 'flex',
          height: 6,
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {visible.map((lang) => {
          const pct = ((lang.size / totalSize) * 100).toFixed(1);
          return (
            <div
              key={lang.name}
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: lang.color || '#3b82f6',
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          fontSize: 13,
          fontWeight: 500,
          color: textColor,
          opacity: 0.85,
        }}
      >
        {visible.map((lang) => {
          const pct = Math.round((lang.size / totalSize) * 100);
          return (
            <div
              key={lang.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: lang.color || '#3b82f6',
                }}
              />
              <span>{lang.name}</span>
              <span style={{ opacity: 0.6 }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
