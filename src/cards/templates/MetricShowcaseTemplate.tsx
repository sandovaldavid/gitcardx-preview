import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { AvatarGroup } from '../primitives/AvatarGroup';
import { FormattedText } from '../primitives/FormattedText';
import { LanguageBar } from '../primitives/LanguageBar';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { StarMetricIcon, ForkMetricIcon } from '../icons/metricIcons';
import { formatCompactMetric } from '../primitives/formatters';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';
import { ThemeEngine } from '@/core/theme/ThemeEngine';

export const MetricShowcaseTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';
  const fontHeading = config.typography?.fontHeading || 'Inter';
  const fontMono = config.typography?.fontMono || 'JetBrains Mono';
  const techStack = detectTechStack(repo.languages, repo.topics, 4);
  const isLight = ThemeEngine.isLightColor(palette.background);
  const statBoxBg = isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)';
  const verifiedColor = ThemeEngine.ensureReadableText(palette.background, palette.accent, false);
  const starAccentColor = ThemeEngine.ensureReadableText(palette.background, palette.accent, true);

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

      {/* Top Header */}
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
              width={56}
              height={56}
              style={{
                width: 56,
                height: 56,
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {visibility.issues && typeof repo.openIssuesCount === 'number' && (
            <MetricPill
              type="issues"
              value={formatCompactMetric(repo.openIssuesCount)}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
              label="issues"
              fontFamily={fontMono}
            />
          )}
          {visibility.discussions && typeof repo.discussionsCount === 'number' && (
            <MetricPill
              type="discussions"
              value={formatCompactMetric(repo.discussionsCount)}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
              label="discussions"
              fontFamily={fontMono}
            />
          )}
          {visibility.license && repo.license && (
            <MetricPill
              type="license"
              value={repo.license}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
              fontFamily={fontMono}
            />
          )}
          {visibility.release && repo.latestRelease && (
            <MetricPill
              type="release"
              value={repo.latestRelease.tag}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
              fontFamily={fontMono}
            />
          )}
        </div>
      </div>

      {/* Middle: Title, Description, Stack Badges & Hero Metric Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 40,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCenter ? 'center' : 'flex-start',
            textAlign: isCenter ? 'center' : 'left',
            gap: 16,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: palette.text,
              margin: 0,
            }}
          >
            <FormattedText
              text={config.title || repo.name}
              accentColor={palette.accent}
              textColor={palette.text}
            />
          </div>
          {visibility.tagline && (
            <p
              style={{
                fontSize: 28,
                lineHeight: 1.38,
                color: palette.text,
                opacity: 0.9,
                margin: 0,
                maxWidth: 680,
              }}
            >
              <FormattedText
                text={
                  config.tagline ||
                  repo.description ||
                  'Open source software built for developers worldwide.'
                }
                accentColor={palette.accent}
                textColor={palette.text}
              />
            </p>
          )}

          {visibility.techStack && techStack.length > 0 && (
            <div style={{ display: 'flex', marginTop: 4 }}>
              <StackBadgeRow
                items={techStack}
                textColor={palette.text}
                borderColor={palette.border}
                showOfficialLogos={visibility.languageLogos}
              />
            </div>
          )}
        </div>

        {/* Hero Stat Box */}
        {(visibility.stars || visibility.forks) && (
          <div
            style={{
              display: 'flex',
              gap: 18,
              flexShrink: 0,
            }}
          >
            {visibility.stars && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingLeft: 30,
                  paddingRight: 30,
                  borderRadius: 20,
                  border: `1.5px solid ${palette.border}`,
                  backgroundColor: statBoxBg,
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StarMetricIcon color={starAccentColor} size={32} />
                  <span
                    style={{
                      fontFamily: fontMono,
                      fontSize: 46,
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      color: starAccentColor,
                    }}
                  >
                    {formatCompactMetric(repo.stars)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: palette.text,
                    opacity: 0.9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  GitHub Stars
                </span>
              </div>
            )}

            {visibility.forks && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingLeft: 30,
                  paddingRight: 30,
                  borderRadius: 20,
                  border: `1.5px solid ${palette.border}`,
                  backgroundColor: statBoxBg,
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ForkMetricIcon color={palette.text} size={32} />
                  <span
                    style={{
                      fontFamily: fontMono,
                      fontSize: 46,
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      color: palette.text,
                    }}
                  >
                    {formatCompactMetric(repo.forks)}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: palette.text,
                    opacity: 0.9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Forks
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer: Contributors & Languages */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {visibility.contributors && repo.contributors.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <AvatarGroup
                contributors={repo.contributors}
                borderColor={palette.border}
                maxAvatars={6}
                size={44}
              />
              <span style={{ fontSize: 16, fontWeight: 600, color: palette.text, opacity: 0.95 }}>
                {repo.contributorsCount && repo.contributorsCount > 1
                  ? `${formatCompactMetric(repo.contributorsCount)} contributors`
                  : repo.contributorsCount === 1
                    ? '1 contributor'
                    : 'Active contributors'}
              </span>
            </div>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: verifiedColor }}>
              Verified open source repository
            </span>
          </div>
        </div>

        {repo.languages.length > 0 && (
          <LanguageBar languages={repo.languages} textColor={palette.text} />
        )}
      </div>

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};

export const OssCredibilityTemplate = MetricShowcaseTemplate;
