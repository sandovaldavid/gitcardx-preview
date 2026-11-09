import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { FormattedText } from '../primitives/FormattedText';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';
import { ThemeEngine } from '@/core/theme/ThemeEngine';

export const VersionHeroTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';
  const fontHeading = config.typography?.fontHeading || 'Inter';
  const fontMono = config.typography?.fontMono || 'JetBrains Mono';
  const techStack = detectTechStack(repo.languages, repo.topics, 5);
  const hasRealRelease = Boolean(repo.latestRelease?.tag);
  const releaseTag = repo.latestRelease?.tag || '-';
  const isLight = ThemeEngine.isLightColor(palette.background);

  const badgeBg = hasRealRelease
    ? isLight
      ? 'rgba(22, 163, 74, 0.12)'
      : 'rgba(34, 197, 94, 0.12)'
    : isLight
      ? 'rgba(37, 99, 235, 0.12)'
      : 'rgba(59, 130, 246, 0.12)';
  const badgeBorder = hasRealRelease
    ? isLight
      ? 'rgba(22, 163, 74, 0.35)'
      : 'rgba(34, 197, 94, 0.4)'
    : isLight
      ? 'rgba(37, 99, 235, 0.35)'
      : 'rgba(59, 130, 246, 0.4)';
  const badgeColor = hasRealRelease
    ? isLight
      ? '#15803d'
      : '#22c55e'
    : isLight
      ? '#1d4ed8'
      : '#60a5fa';

  const spotlightTextColor = hasRealRelease
    ? ThemeEngine.getContrastTextColor(palette.accent)
    : palette.text;
  const spotlightBg = hasRealRelease
    ? palette.accent
    : isLight
      ? 'rgba(0, 0, 0, 0.06)'
      : 'rgba(255, 255, 255, 0.1)';

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
        customImageUrl={config.customBackgroundUrl}
      />

      {/* Top Header: Owner + Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
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
                backgroundColor: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
              }}
            />
            <span style={{ fontSize: 24, fontWeight: 700, color: palette.text }}>
              {repo.owner.login}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 16,
            paddingRight: 18,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 9999,
            backgroundColor: badgeBg,
            border: `1px solid ${badgeBorder}`,
            color: badgeColor,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: badgeColor,
            }}
          />
          <span>{hasRealRelease ? 'NEW RELEASE' : 'ACTIVE REPO'}</span>
        </div>
      </div>

      {/* Center: Release Tag Spotlight + Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCenter ? 'center' : 'flex-start',
          textAlign: isCenter ? 'center' : 'left',
          gap: 20,
          zIndex: 1,
        }}
      >
        {visibility.release && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCenter ? 'center' : 'flex-start',
              gap: 18,
            }}
          >
            <div
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 12,
                backgroundColor: spotlightBg,
                color: spotlightTextColor,
                fontFamily: fontMono,
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {releaseTag}
            </div>
            {repo.latestRelease?.publishedAt && (
              <span
                style={{
                  fontSize: 18,
                  color: palette.text,
                  opacity: 0.88,
                  fontFamily: fontMono,
                }}
              >
                released{' '}
                {new Date(repo.latestRelease.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        )}

        <h1
          style={{
            fontSize: 64,
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
              fontSize: 28,
              lineHeight: 1.38,
              color: palette.text,
              opacity: 0.9,
              margin: 0,
              maxWidth: 960,
            }}
          >
            <FormattedText
              text={
                config.tagline ||
                repo.description ||
                'Major performance improvements, new features, and bug fixes.'
              }
              accentColor={palette.accent}
              textColor={palette.text}
            />
          </p>
        )}
      </div>

      {/* Bottom Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
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
          {visibility.issues && typeof repo.openIssuesCount === 'number' && (
            <MetricPill
              type="issues"
              value={repo.openIssuesCount}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
              label="issues"
            />
          )}
          {visibility.discussions && typeof repo.discussionsCount === 'number' && (
            <MetricPill
              type="discussions"
              value={repo.discussionsCount}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
              label="discussions"
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

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};

export const ReleaseSpotlightTemplate = VersionHeroTemplate;
