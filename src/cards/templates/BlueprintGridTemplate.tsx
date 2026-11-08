import React from 'react';
import type { CardRenderProps } from '../types';
import { ArchitecturalGrid } from '../backgrounds/ArchitecturalGrid';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const BlueprintGridTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility } = config;
  const techStack = detectTechStack(repo.languages, repo.topics, 5);

  return (
    <div
      style={{
        width: 1280,
        height: 640,
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 56,
        backgroundColor: palette.background,
        overflow: 'hidden',
        fontFamily: 'Inter',
      }}
    >
      <ArchitecturalGrid accentColor={palette.accent} borderColor={palette.border} opacity={0.65} />

      {/* Top Header: Technical Specs & Blueprint ID */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 4,
              paddingBottom: 4,
              borderRadius: 4,
              backgroundColor: palette.accent,
              color: '#000000',
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            SYS//SPEC
          </div>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 16,
              color: palette.text,
              opacity: 0.95,
            }}
          >
            {repo.owner.login} / {repo.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 13,
              color: palette.text,
              opacity: 0.85,
            }}
          >
            ARCH_V1.0 // 1280×640
          </span>
          {visibility.license && repo.license && (
            <MetricPill
              type="license"
              value={repo.license}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
            />
          )}
        </div>
      </div>

      {/* Center: Hero Title & Architectural Outline Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 1,
          borderLeft: `4px solid ${palette.accent}`,
          paddingLeft: 24,
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 14,
            color: palette.accent,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          [ SPECIFICATION MODULE ]
        </span>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: palette.text,
            margin: 0,
          }}
        >
          {config.title || repo.name}
        </h1>
        <p
          style={{
            fontSize: 22,
            lineHeight: 1.4,
            color: palette.text,
            opacity: 0.9,
            margin: 0,
            maxWidth: 880,
          }}
        >
          {config.tagline ||
            repo.description ||
            'System architecture and developer infrastructure module.'}
        </p>
      </div>

      {/* Bottom Footer: Tech Modules & Metric Indicators */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
          borderTop: `1px solid ${palette.border}`,
          paddingTop: 20,
        }}
      >
        {visibility.techStack && techStack.length > 0 ? (
          <StackBadgeRow
            items={techStack}
            textColor={palette.text}
            borderColor={palette.border}
            showOfficialLogos={visibility.languageLogos}
          />
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {visibility.stars && (
            <MetricPill
              type="stars"
              value={repo.stars}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
            />
          )}
          {visibility.forks && (
            <MetricPill
              type="forks"
              value={repo.forks}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
            />
          )}
        </div>
      </div>

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};
