import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { TechIcon } from '../primitives/TechIcon';
import { FormattedText } from '../primitives/FormattedText';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const LinearMinimalTemplate: React.FC<CardRenderProps> = ({
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
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 60,
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

      {/* Top Header: Owner Identity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            isCenter && (!visibility.author || !repo.primaryLanguage) ? 'center' : 'space-between',
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
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: palette.text,
                  opacity: 0.95,
                }}
              >
                {repo.owner.login}
              </span>
            </div>
          </div>
        ) : (
          <div />
        )}

        {repo.primaryLanguage && (
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
              border: `1.5px solid ${palette.border}`,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              fontSize: 16,
              fontWeight: 600,
              color: palette.text,
            }}
          >
            <TechIcon
              name={repo.primaryLanguage.name}
              color={repo.primaryLanguage.color}
              size={18}
              showOfficialLogo={visibility.languageLogos}
            />
            <span>{repo.primaryLanguage.name}</span>
          </div>
        )}
      </div>

      {/* Middle Body: Repo Title & Tagline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCenter ? 'center' : 'flex-start',
          textAlign: isCenter ? 'center' : 'left',
          gap: 16,
          zIndex: 1,
          maxWidth: 1080,
          margin: isCenter ? '0 auto' : undefined,
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: '-0.03em',
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
              fontWeight: 400,
              color: palette.text,
              opacity: 0.9,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            <FormattedText
              text={
                config.tagline ||
                repo.description ||
                'Give your GitHub repository a modern visual identity.'
              }
              accentColor={palette.accent}
              textColor={palette.text}
            />
          </p>
        )}
      </div>

      {/* Bottom Footer: Stack Badges & Metric Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCenter ? 'center' : 'space-between',
          gap: isCenter ? 24 : 0,
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
