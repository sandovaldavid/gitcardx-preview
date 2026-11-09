import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { FormattedText } from '../primitives/FormattedText';
import { MetricPill } from '../primitives/MetricPill';
import { suggestInstallCommand } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const CliTerminalTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const isCenter = config.contentAlign === 'center';
  const fontHeading = config.typography?.fontHeading || 'Inter';
  const fontMono = config.typography?.fontMono || 'JetBrains Mono';
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

      {/* Top Header: Monospace Path */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCenter && !visibility.author ? 'center' : 'space-between',
          zIndex: 1,
        }}
      >
        {visibility.author ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontFamily: fontMono,
                fontSize: 18,
                color: palette.accent,
                fontWeight: 700,
              }}
            >
              ~/
            </span>
            <span
              style={{
                fontFamily: fontMono,
                fontSize: 20,
                color: palette.text,
                opacity: 0.95,
                fontWeight: 600,
              }}
            >
              {repo.owner.login}/{repo.name}
            </span>
          </div>
        ) : (
          <div />
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

      {/* Middle: Title, Tagline & Terminal Window */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCenter ? 'center' : 'flex-start',
            textAlign: isCenter ? 'center' : 'left',
            gap: 10,
          }}
        >
          <h1
            style={{
              fontSize: 54,
              fontWeight: 800,
              letterSpacing: '-0.02em',
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
              }}
            >
              <FormattedText
                text={config.tagline || repo.description || 'Command line utility & developer tool'}
                accentColor={palette.accent}
                textColor={palette.text}
              />
            </p>
          )}
        </div>

        {visibility.installCommand && (
          <TerminalWindow
            command={command}
            textColor={palette.text}
            borderColor={palette.border}
            accentColor={palette.accent}
            title={`${repo.name} — zsh`}
            fontMono={fontMono}
          />
        )}
      </div>

      {/* Bottom Footer: Stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCenter ? 'center' : 'space-between',
          gap: isCenter ? 24 : 0,
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
            }}
          />
          <span
            style={{
              fontFamily: fontMono,
              fontSize: 14,
              color: palette.text,
              opacity: 0.88,
            }}
          >
            ready for production
          </span>
        </div>

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

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};
