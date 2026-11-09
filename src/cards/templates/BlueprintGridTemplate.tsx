import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { FormattedText } from '../primitives/FormattedText';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const BlueprintGridTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';
  const fontHeading = config.typography?.fontHeading || 'Inter';
  const fontMono = config.typography?.fontMono || 'JetBrains Mono';
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
        fontFamily: fontHeading,
      }}
    >
      <BackgroundRenderer
        pattern={backgroundPattern}
        accentColor={palette.accent}
        borderColor={palette.border}
        customImageUrl={config.customLogoUrl}
      />

      {/* Top Header: Technical Specs & Blueprint ID */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCenter && !visibility.author ? 'center' : 'space-between',
          zIndex: 1,
        }}
      >
        {visibility.author ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 5,
                paddingBottom: 5,
                borderRadius: 4,
                backgroundColor: palette.accent,
                color: '#000000',
                fontFamily: fontMono,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: '0.05em',
              }}
            >
              SYS//SPEC
            </div>
            <span
              style={{
                fontFamily: fontMono,
                fontSize: 18,
                fontWeight: 600,
                color: palette.text,
                opacity: 0.95,
              }}
            >
              {repo.owner.login} / {repo.name}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontFamily: fontMono,
              fontSize: 15,
              fontWeight: 500,
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
          alignItems: isCenter ? 'center' : 'flex-start',
          textAlign: isCenter ? 'center' : 'left',
          gap: 16,
          zIndex: 1,
          borderLeft: isCenter ? undefined : `4px solid ${palette.accent}`,
          paddingLeft: isCenter ? 0 : 24,
        }}
      >
        <span
          style={{
            fontFamily: fontMono,
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
          <FormattedText
            text={config.title || repo.name}
            accentColor={palette.accent}
            textColor={palette.text}
          />
        </h1>
        {visibility.tagline && (
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
            <FormattedText
              text={
                config.tagline ||
                repo.description ||
                'System architecture and developer infrastructure module.'
              }
              accentColor={palette.accent}
              textColor={palette.text}
            />
          </p>
        )}
      </div>

      {/* Bottom Footer: Tech Modules & Metric Indicators */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCenter ? 'center' : 'space-between',
          gap: isCenter ? 24 : 0,
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
