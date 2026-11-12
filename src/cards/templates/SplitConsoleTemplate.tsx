import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { FormattedText } from '../primitives/FormattedText';
import { MetricPill } from '../primitives/MetricPill';
import { detectTechStack, suggestInstallCommand } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';
import { ThemeEngine } from '@/core/theme/ThemeEngine';

export const SplitConsoleTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';
  const isLight = ThemeEngine.isLightColor(palette.background);
  const fontHeading = config.typography?.fontHeading || 'Inter';
  const fontMono = config.typography?.fontMono || 'JetBrains Mono';
  const techStack = detectTechStack(repo.languages, repo.topics, 4);
  const defaultCmd = suggestInstallCommand(
    repo.languages,
    repo.topics,
    repo.name,
    repo.owner.login
  );
  const command = config.installCommand || defaultCmd;

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

      {/* Left Column (55%): Branding, Title, Tagline, Stack */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: isCenter ? 'center' : 'flex-start',
          textAlign: isCenter ? 'center' : 'left',
          height: '100%',
          width: 640,
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
            <span style={{ fontSize: 24, fontWeight: 700, color: palette.text, opacity: 0.95 }}>
              {repo.owner.login}
            </span>
            <span
              style={{
                fontSize: 13,
                fontFamily: fontMono,
                fontWeight: 700,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 4,
                paddingBottom: 4,
                borderRadius: 6,
                backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
                color: ThemeEngine.ensureReadableText(palette.background, palette.accent),
                letterSpacing: '0.05em',
              }}
            >
              PACKAGE
            </span>
          </div>
        ) : (
          <div />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCenter ? 'center' : 'flex-start',
            textAlign: isCenter ? 'center' : 'left',
            gap: 14,
          }}
        >
          <div
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
          </div>
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
                  config.tagline ||
                  repo.description ||
                  'Lightweight, modern library built for production.'
                }
                accentColor={palette.accent}
                textColor={palette.text}
              />
            </p>
          )}
        </div>

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
      </div>

      {/* Right Column (45%): Terminal + Stats Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: 480,
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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

        {visibility.installCommand ? (
          <TerminalWindow
            command={command}
            textColor={palette.text}
            borderColor={palette.border}
            accentColor={palette.accent}
            title="terminal"
            fontMono={fontMono}
          />
        ) : (
          <div />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
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

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};

export const SdkPackageTemplate = SplitConsoleTemplate;
