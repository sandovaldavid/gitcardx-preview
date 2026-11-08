import React from 'react';
import type { CardRenderProps } from '../types';
import { BackgroundRenderer } from '../backgrounds/BackgroundRenderer';
import { MetricPill } from '../primitives/MetricPill';
import { StackBadgeRow } from '../primitives/StackBadgeRow';
import { TechIcon } from '../primitives/TechIcon';
import { detectTechStack } from '@/core/domain/stackMapper';
import { SafeZoneGuides } from '../primitives/SafeZoneGuides';

export const LinearMinimalTemplate: React.FC<CardRenderProps> = ({
  repo,
  config,
  showSafeZoneGuides = false,
}) => {
  const { palette, visibility, backgroundPattern } = config;
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
        fontFamily: 'Inter',
      }}
    >
      <BackgroundRenderer
        pattern={backgroundPattern}
        accentColor={palette.accent}
        borderColor={palette.border}
        customImageUrl={config.customLogoUrl}
      />

      {/* Top Header: Owner Identity */}
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
            width={48}
            height={48}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              border: `1px solid ${palette.border}`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: palette.text,
                opacity: 0.85,
              }}
            >
              {repo.owner.login}
            </span>
          </div>
        </div>

        {repo.primaryLanguage && (
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
              border: `1px solid ${palette.border}`,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              fontSize: 15,
              fontWeight: 500,
              color: palette.text,
            }}
          >
            <TechIcon
              name={repo.primaryLanguage.name}
              color={repo.primaryLanguage.color}
              size={15}
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
          gap: 16,
          zIndex: 1,
          maxWidth: 1080,
        }}
      >
        <h1
          style={{
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: '-0.03em',
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
            fontWeight: 400,
            color: palette.text,
            opacity: 0.72,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {config.tagline ||
            repo.description ||
            'Give your GitHub repository a modern visual identity.'}
        </p>
      </div>

      {/* Bottom Footer: Stack Badges & Metric Pills */}
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
