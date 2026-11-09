import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { MetricPill } from '../primitives/MetricPill';
import { FormattedText } from '../primitives/FormattedText';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { TechIcon } from '../primitives/TechIcon';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';
import { ThemeEngine } from '@/core/theme/ThemeEngine';

export const AuthorSpotlightTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';
  const fontHeading = config.typography?.fontHeading || 'Inter';
  const techStack = detectTechStack(repo.languages, repo.topics, 4);
  const isLight = ThemeEngine.isLightColor(palette.background);

  return (
    <div
      style={{
        width: 1280,
        height: 640,
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
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

      {/* Left Column: Creator Identity & Brand Card */}
      {visibility.author ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            width: 320,
            height: '100%',
            borderRadius: 20,
            border: `1px solid ${palette.border}`,
            backgroundColor: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
            zIndex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.customLogoUrl || repo.owner.avatarUrl}
            alt={repo.owner.login}
            width={120}
            height={120}
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `3px solid ${palette.accent}`,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: palette.text }}>
              @{repo.owner.login}
            </span>
            <span style={{ fontSize: 16, fontWeight: 500, color: palette.text, opacity: 0.88 }}>
              Project Creator & Author
            </span>
          </div>

          {repo.primaryLanguage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 12,
                paddingRight: 14,
                paddingTop: 5,
                paddingBottom: 5,
                borderRadius: 9999,
                border: `1px solid ${palette.border}`,
                fontSize: 13,
                color: palette.text,
              }}
            >
              <TechIcon
                name={repo.primaryLanguage.name}
                color={repo.primaryLanguage.color}
                size={14}
                showOfficialLogo={visibility.languageLogos}
              />
              <span>{repo.primaryLanguage.name}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Right Column: Repo Details & Metrics */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: isCenter ? 'center' : 'stretch',
          height: '100%',
          width: visibility.author ? 780 : 1160,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            gap: 10,
          }}
        >
          {visibility.release && repo.latestRelease && (
            <MetricPill
              type="release"
              value={repo.latestRelease.tag}
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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCenter ? 'center' : 'flex-start',
            textAlign: isCenter ? 'center' : 'left',
            gap: 14,
          }}
        >
          <h1
            style={{
              fontSize: 62,
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
                fontSize: 26,
                lineHeight: 1.38,
                color: palette.text,
                opacity: 0.9,
                margin: 0,
              }}
            >
              <FormattedText
                text={
                  config.tagline || repo.description || 'Crafted with precision by indie developer.'
                }
                accentColor={palette.accent}
                textColor={palette.text}
              />
            </p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
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
          </div>
        </div>
      </div>

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};

export const CreatorSignatureTemplate = AuthorSpotlightTemplate;
