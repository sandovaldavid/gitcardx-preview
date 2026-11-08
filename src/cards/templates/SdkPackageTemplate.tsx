import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { MetricPill } from '../primitives/MetricPill';
import { detectTechStack, suggestInstallCommand } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const SdkPackageTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const techStack = detectTechStack(repo.languages, repo.topics, 4);
  const defaultCmd = suggestInstallCommand(repo.languages, repo.topics, repo.name, repo.owner.login);
  const command = config.installCommand || defaultCmd;

  return (
    <div
      style={{
        width: 1280,
        height: 640,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
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

      {/* Left Column (55%): Branding, Title, Tagline, Stack */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: 640,
          zIndex: 1,
        }}
      >
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
              borderRadius: 10,
              border: `1px solid ${palette.border}`,
            }}
          />
          <span style={{ fontSize: 20, fontWeight: 600, color: palette.text, opacity: 0.9 }}>
            {repo.owner.login}
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: 'JetBrains Mono',
              paddingLeft: 8,
              paddingRight: 8,
              paddingTop: 3,
              paddingBottom: 3,
              borderRadius: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: palette.accent,
            }}
          >
            PACKAGE
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h1
            style={{
              fontSize: 52,
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
              opacity: 0.72,
              margin: 0,
            }}
          >
            {config.tagline || repo.description || 'Lightweight, modern library built for production.'}
          </p>
        </div>

        {visibility.techStack && techStack.length > 0 && (
          <StackBadgeRow
            items={techStack}
            textColor={palette.text}
            borderColor={palette.border}
          />
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

        <TerminalWindow
          command={command}
          textColor={palette.text}
          borderColor={palette.border}
          accentColor={palette.accent}
          title="terminal"
        />

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
        </div>
      </div>

      {showSafeZoneGuides && <SafeZoneGuides />}
    </div>
  );
};
