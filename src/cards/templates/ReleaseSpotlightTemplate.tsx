import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const ReleaseSpotlightTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
  const techStack = detectTechStack(repo.languages, repo.topics, 5);
  const hasRealRelease = Boolean(repo.latestRelease?.tag);
  const releaseTag = repo.latestRelease?.tag || 'main';

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

      {/* Top Header: Owner + Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
              borderRadius: 12,
              border: `1px solid ${palette.border}`,
            }}
          />
          <span style={{ fontSize: 20, fontWeight: 600, color: palette.text }}>
            {repo.owner.login}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingLeft: 14,
            paddingRight: 16,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: 9999,
            backgroundColor: hasRealRelease
              ? 'rgba(34, 197, 94, 0.12)'
              : 'rgba(59, 130, 246, 0.12)',
            border: `1px solid ${hasRealRelease ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
            color: hasRealRelease ? '#22c55e' : '#60a5fa',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: hasRealRelease ? '#22c55e' : '#60a5fa',
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
          gap: 20,
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 12,
              backgroundColor: palette.accent,
              color: '#000000',
              fontFamily: 'JetBrains Mono',
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
                opacity: 0.65,
                fontFamily: 'JetBrains Mono',
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
          {config.title || repo.name}
        </h1>

        <p
          style={{
            fontSize: 24,
            lineHeight: 1.4,
            color: palette.text,
            opacity: 0.75,
            margin: 0,
            maxWidth: 960,
          }}
        >
          {config.tagline ||
            repo.description ||
            'Major performance improvements, new features, and bug fixes.'}
        </p>
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
