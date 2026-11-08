import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { AvatarGroup } from '../primitives/AvatarGroup';
import { FormattedText } from '../primitives/FormattedText';
import { LanguageBar } from '../primitives/LanguageBar';
import { MetricPill } from '../primitives/MetricPill';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const OssCredibilityTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';

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
      <BackgroundRenderer
        pattern={backgroundPattern}
        accentColor={palette.accent}
        borderColor={palette.border}
        customImageUrl={config.customLogoUrl}
      />

      {/* Top Header */}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.customLogoUrl || repo.owner.avatarUrl}
              alt={repo.owner.login}
              width={44}
              height={44}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `1px solid ${palette.border}`,
              }}
            />
            <span style={{ fontSize: 20, fontWeight: 600, color: palette.text }}>
              {repo.owner.login}
            </span>
            <span style={{ fontSize: 18, color: palette.border }}>/</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: palette.accent }}>
              {repo.name}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {visibility.license && repo.license && (
            <MetricPill
              type="license"
              value={repo.license}
              textColor={palette.text}
              borderColor={palette.border}
              accentColor={palette.accent}
            />
          )}
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

      {/* Middle: Title, Description & Hero Metric Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: isCenter ? 'column' : 'row',
          justifyContent: isCenter ? 'center' : 'space-between',
          alignItems: 'center',
          gap: isCenter ? 20 : 40,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCenter ? 'center' : 'flex-start',
            textAlign: isCenter ? 'center' : 'left',
            gap: 14,
            flex: isCenter ? undefined : 1,
          }}
        >
          <h1
            style={{
              fontSize: 54,
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
                maxWidth: 720,
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
        </div>

        {/* Hero Stat Box */}
        <div
          style={{
            display: 'flex',
            gap: 16,
          }}
        >
          {visibility.stars && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 18,
                paddingBottom: 18,
                paddingLeft: 28,
                paddingRight: 28,
                borderRadius: 16,
                border: `1px solid ${palette.border}`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <span style={{ fontSize: 36, fontWeight: 800, color: palette.accent }}>
                {repo.stars.toLocaleString()}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: palette.text, opacity: 0.88 }}>
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
                paddingTop: 18,
                paddingBottom: 18,
                paddingLeft: 28,
                paddingRight: 28,
                borderRadius: 16,
                border: `1px solid ${palette.border}`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <span style={{ fontSize: 36, fontWeight: 800, color: palette.text }}>
                {repo.forks.toLocaleString()}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: palette.text, opacity: 0.88 }}>
                Forks
              </span>
            </div>
          )}
        </div>
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
            justifyContent: isCenter ? 'center' : 'space-between',
            gap: isCenter ? 24 : 0,
          }}
        >
          {visibility.contributors && repo.contributors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <AvatarGroup
                contributors={repo.contributors}
                borderColor={palette.border}
                maxAvatars={6}
                size={38}
              />
              <span style={{ fontSize: 14, color: palette.text, opacity: 0.88 }}>
                active maintainers
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: palette.text, opacity: 0.88 }}>
              verified open source repository
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
