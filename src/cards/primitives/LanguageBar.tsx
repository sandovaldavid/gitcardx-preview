import React from 'react';
import { colord } from 'colord';
import type { RepoLanguageSchema } from '@/core/domain/schemas';
import { z } from 'zod';
import { resolveDistinctLanguageColors } from '@/core/domain/languageColors';

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
  const visible = resolveDistinctLanguageColors(languages.slice(0, maxLanguages));
  const totalSize = visible.reduce((acc, l) => acc + l.size, 0);

  if (totalSize === 0) return null;

  const isLightMode = colord(textColor).isDark();
  const barBg = isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%',
      }}
    >
      {/* Proportion Bar */}
      <div
        style={{
          display: 'flex',
          height: 10,
          width: '100%',
          borderRadius: 5,
          overflow: 'hidden',
          backgroundColor: barBg,
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
                backgroundColor: lang.color,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          fontSize: 17,
          fontWeight: 700,
          color: textColor,
          opacity: 0.95,
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
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: lang.color,
                }}
              />
              <span>{lang.name}</span>
              <span style={{ opacity: 0.7, fontWeight: 500 }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
