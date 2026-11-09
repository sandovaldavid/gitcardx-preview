import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const AuroraMeshTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';
  const fontHeading = config.typography?.fontHeading || 'Inter';
  const techStack = detectTechStack(repo.languages, repo.topics, 5);

  return (
    <div
      style={{
        width: 1280,
        height: 640,
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        backgroundColor: palette.background,
        overflow: 'hidden',
        fontFamily: fontHeading,
      }}
    >
      <BackgroundRenderer
        pattern={backgroundPattern}
        accentColor={palette.accent}
        borderColor={palette.border}
        customImageUrl={config.customBackgroundUrl}
      />

      {/* Frosted Container Card */}
      <div
        style={{
          width: 1184,
          height: 544,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 48,
          borderRadius: 24,
          border: `1px solid ${palette.border}`,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          zIndex: 1,
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              isCenter && (!visibility.author || !visibility.release || !repo.latestRelease)
                ? 'center'
                : 'space-between',
          }}
        >
          {visibility.author ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.customLogoUrl || repo.owner.avatarUrl}
                alt={repo.owner.login}
                width={54}
                height={54}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  border: `2px solid ${palette.border}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              />
              <span style={{ fontSize: 24, fontWeight: 700, color: palette.text }}>
                {repo.owner.login}
              </span>
            </div>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {visibility.release && repo.latestRelease && (
              <MetricPill
                type="release"
                value={repo.latestRelease.tag}
                textColor={palette.text}
                borderColor={palette.border}
                accentColor={palette.accent}
              />
            )}
          </div>
        </div>

        {/* Center Title & Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCenter ? 'center' : 'flex-start',
            textAlign: isCenter ? 'center' : 'left',
            gap: 16,
          }}
        >
          <h1
            style={{
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: palette.text,
              margin: 0,
            }}
          >
            {config.title || repo.name}
          </h1>
          {visibility.tagline && (
            <p
              style={{
                fontSize: 24,
                lineHeight: 1.4,
                color: palette.text,
                opacity: 0.9,
                margin: 0,
                maxWidth: 960,
              }}
            >
              {config.tagline || repo.description || 'Next-generation architecture for developers.'}
            </p>
          )}
        </div>

        {/* Bottom Bar: Stack & Metrics */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCenter ? 'center' : 'space-between',
            gap: isCenter ? 24 : 0,
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
      </div>

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};
