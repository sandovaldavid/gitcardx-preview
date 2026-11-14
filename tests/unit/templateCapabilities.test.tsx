import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { renderCardToSvg } from '@/cards/engine/satoriRenderer';
import {
  CARD_TEMPLATES,
  TEMPLATE_CAPABILITIES,
  getAllLayerVisibilityStates,
  getLayerVisibilityState,
  getTemplateCapabilities,
} from '@/cards/templates/CardTemplateRegistry';
import {
  TemplateIdSchema,
  type CardConfig,
  type CardVisibility,
  type RepoMetadata,
  type TemplateId,
} from '@/core/domain/schemas';
import { DEFAULT_CONFIG, DEFAULT_REPO, useCardStore } from '@/studio/state/useCardStore';
import { LeftInspector } from '@/studio/components/LeftInspector';

const TINY_PNG_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const CUSTOM_LOGO_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const FULL_REPO: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl: TINY_PNG_DATA_URI,
    isOrg: false,
  },
  name: 'gitframe',
  description: 'Instant high-impact GitHub social preview cards.',
  homepageUrl: 'https://gitframe.dev',
  stars: 1420,
  forks: 98,
  openIssuesCount: 12,
  discussionsCount: 6,
  primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
  languages: [
    { name: 'TypeScript', color: '#3178C6', size: 120000 },
    { name: 'React', color: '#61DAFB', size: 80000 },
  ],
  topics: ['nextjs', 'tailwind', 'svg'],
  license: 'MIT',
  latestRelease: { tag: 'v2.4.0', publishedAt: '2026-10-01T12:00:00Z' },
  contributors: [
    { login: 'alice', avatarUrl: TINY_PNG_DATA_URI },
    { login: 'bob', avatarUrl: TINY_PNG_DATA_URI },
  ],
};

const ALL_VISIBLE: CardVisibility = {
  stars: true,
  forks: true,
  release: true,
  license: true,
  contributors: true,
  techStack: true,
  languageLogos: true,
  author: true,
  tagline: true,
  installCommand: true,
  issues: true,
  discussions: true,
};

const ALL_VISIBILITY_KEYS = Object.keys(ALL_VISIBLE) as Array<keyof CardVisibility>;

function buildConfig(
  templateId: TemplateId,
  visibilityOverrides: Partial<CardVisibility> = {},
  configOverrides: Partial<CardConfig> = {}
): CardConfig {
  return {
    ...DEFAULT_CONFIG,
    templateId,
    installCommand: 'bun add gitframe',
    ...configOverrides,
    visibility: {
      ...ALL_VISIBLE,
      ...visibilityOverrides,
    },
  };
}

describe('Template capabilities & Satori SVG parity', () => {
  it('registers capabilities on every template definition in CARD_TEMPLATES', () => {
    for (const templateId of TemplateIdSchema.options) {
      expect(CARD_TEMPLATES[templateId].capabilities).toEqual(TEMPLATE_CAPABILITIES[templateId]);
      expect(getTemplateCapabilities(templateId)).toEqual(TEMPLATE_CAPABILITIES[templateId]);
    }
  });

  it('matches actual Satori SVG output for all 8 templates x 12 visibility layers and customLogoUrl', async () => {
    for (const templateId of TemplateIdSchema.options) {
      const capabilities = TEMPLATE_CAPABILITIES[templateId];
      const baselineSvg = await renderCardToSvg(FULL_REPO, buildConfig(templateId));

      for (const key of ALL_VISIBILITY_KEYS) {
        const toggledSvg = await renderCardToSvg(
          FULL_REPO,
          buildConfig(templateId, { [key]: false })
        );
        const supported = capabilities.visibility[key];

        if (supported) {
          expect(
            toggledSvg,
            `Expected ${templateId} to stop rendering "${key}" when toggled off`
          ).not.toBe(baselineSvg);
        } else {
          expect(
            toggledSvg,
            `Expected ${templateId} SVG to ignore unsupported layer "${key}"`
          ).toBe(baselineSvg);
        }
      }

      const customLogoSvg = await renderCardToSvg(
        FULL_REPO,
        buildConfig(templateId, {}, { customLogoUrl: CUSTOM_LOGO_DATA_URI })
      );
      if (capabilities.supportsCustomLogo) {
        expect(customLogoSvg).not.toBe(baselineSvg);
      } else {
        expect(customLogoSvg).toBe(baselineSvg);
      }
    }
  }, 30000);

  it('matches primaryLanguageLogoMode rules when techStack is hidden', async () => {
    const modes: Array<{
      templateId: TemplateId;
      author: boolean;
      expectDiff: boolean;
    }> = [
      { templateId: 'modern-minimal', author: false, expectDiff: true },
      { templateId: 'author-spotlight', author: true, expectDiff: true },
      { templateId: 'author-spotlight', author: false, expectDiff: false },
      { templateId: 'metric-showcase', author: true, expectDiff: false },
    ];

    for (const { templateId, author, expectDiff } of modes) {
      const withLogos = await renderCardToSvg(
        FULL_REPO,
        buildConfig(templateId, { techStack: false, author, languageLogos: true })
      );
      const withoutLogos = await renderCardToSvg(
        FULL_REPO,
        buildConfig(templateId, { techStack: false, author, languageLogos: false })
      );

      if (expectDiff) {
        expect(withLogos).not.toBe(withoutLogos);
      } else {
        expect(withLogos).toBe(withoutLogos);
      }

      const state = getLayerVisibilityState(
        'languageLogos',
        templateId,
        FULL_REPO,
        buildConfig(templateId, { techStack: false, author, languageLogos: true })
      );
      expect(state.visibleOnCard).toBe(expectDiff);
    }
  });
});

describe('getLayerVisibilityState edge cases', () => {
  it('treats numeric zero (0) open issues and discussions as available while undefined is no-data', () => {
    const repoWithZeroIssues = {
      ...DEFAULT_REPO,
      openIssuesCount: 0,
      discussionsCount: undefined,
    };

    const issuesState = getLayerVisibilityState(
      'issues',
      'modern-minimal',
      repoWithZeroIssues,
      buildConfig('modern-minimal', { issues: true })
    );
    expect(issuesState).toMatchObject({
      supportedByTemplate: true,
      available: true,
      enabled: true,
      visibleOnCard: true,
    });

    const discussionsState = getLayerVisibilityState(
      'discussions',
      'modern-minimal',
      repoWithZeroIssues,
      buildConfig('modern-minimal', { discussions: true })
    );
    expect(discussionsState).toMatchObject({
      supportedByTemplate: true,
      available: false,
      visibleOnCard: false,
      unavailableReason: 'no-data',
    });
  });

  it('keeps release available on version-hero even when latestRelease is null', () => {
    const repoWithoutRelease = { ...DEFAULT_REPO, latestRelease: null };

    const versionHeroRelease = getLayerVisibilityState(
      'release',
      'version-hero',
      repoWithoutRelease,
      DEFAULT_CONFIG
    );
    expect(versionHeroRelease).toMatchObject({
      supportedByTemplate: true,
      available: true,
      visibleOnCard: true,
    });

    const terminalRelease = getLayerVisibilityState(
      'release',
      'terminal-prompt',
      repoWithoutRelease,
      DEFAULT_CONFIG
    );
    expect(terminalRelease).toMatchObject({
      supportedByTemplate: true,
      available: false,
      visibleOnCard: false,
      unavailableReason: 'no-data',
    });

    const minimalRelease = getLayerVisibilityState(
      'release',
      'modern-minimal',
      FULL_REPO,
      DEFAULT_CONFIG
    );
    expect(minimalRelease).toMatchObject({
      supportedByTemplate: false,
      available: false,
      visibleOnCard: false,
      unavailableReason: 'not-in-template',
    });
  });

  it('marks languageLogos as parent-hidden when techStack is toggled off on stack-only templates', () => {
    const states = getAllLayerVisibilityStates(
      ALL_VISIBILITY_KEYS,
      'split-console',
      FULL_REPO,
      buildConfig('split-console', { techStack: false, languageLogos: true })
    );
    const logosState = states.find((s) => s.key === 'languageLogos');
    expect(logosState).toMatchObject({
      supportedByTemplate: true,
      available: false,
      enabled: true,
      visibleOnCard: false,
      unavailableReason: 'parent-hidden',
    });
  });
});

describe('LeftInspector template-aware layer UI', () => {
  beforeEach(() => {
    useCardStore.setState({
      repo: { ...DEFAULT_REPO },
      config: {
        ...DEFAULT_CONFIG,
        visibility: { ...DEFAULT_CONFIG.visibility },
        typography: { ...DEFAULT_CONFIG.typography },
        backgroundPattern: { ...DEFAULT_CONFIG.backgroundPattern },
      },
      past: [],
      future: [],
    });
  });

  it('renders Modern Minimal template capabilities accurately on SSR', () => {
    const minimalHtml = renderToString(<LeftInspector />);
    expect(minimalHtml).toContain('6/9 active');
    expect(minimalHtml).toContain(
      'data-layer-key="installCommand" data-layer-status="not-in-template"'
    );
    expect(minimalHtml).toContain('data-layer-key="release" data-layer-status="not-in-template"');
    expect(minimalHtml).toContain(
      'data-layer-key="contributors" data-layer-status="not-in-template"'
    );
    expect(minimalHtml).toContain('data-layer-key="discussions" data-layer-status="no-data"');
    expect(minimalHtml).toContain('data-layer-key="issues" data-layer-status="hidden"');
    expect(minimalHtml).toContain('Install Command is not rendered in Modern Minimal');
  });

  it('preserves user visibility preferences across template switches without marking unsupported layers active', () => {
    useCardStore.getState().setTemplateId('terminal-prompt');
    expect(useCardStore.getState().config.visibility.techStack).toBe(true);
    expect(useCardStore.getState().config.visibility.contributors).toBe(true);

    const terminalStates = getAllLayerVisibilityStates(
      ALL_VISIBILITY_KEYS,
      useCardStore.getState().config.templateId,
      useCardStore.getState().repo,
      useCardStore.getState().config
    );
    expect(terminalStates.filter((s) => s.supportedByTemplate)).toHaveLength(9);
    expect(terminalStates.filter((s) => s.visibleOnCard)).toHaveLength(6);
    expect(terminalStates.find((s) => s.key === 'installCommand')?.visibleOnCard).toBe(true);
    expect(terminalStates.find((s) => s.key === 'techStack')?.unavailableReason).toBe(
      'not-in-template'
    );
    expect(terminalStates.find((s) => s.key === 'languageLogos')?.unavailableReason).toBe(
      'not-in-template'
    );
    expect(terminalStates.find((s) => s.key === 'contributors')?.unavailableReason).toBe(
      'not-in-template'
    );

    useCardStore.getState().setTemplateId('metric-showcase');
    const metricStates = getAllLayerVisibilityStates(
      ALL_VISIBILITY_KEYS,
      useCardStore.getState().config.templateId,
      useCardStore.getState().repo,
      useCardStore.getState().config
    );
    expect(metricStates.filter((s) => s.supportedByTemplate)).toHaveLength(11);
    expect(metricStates.filter((s) => s.visibleOnCard)).toHaveLength(8);
    expect(metricStates.find((s) => s.key === 'contributors')?.visibleOnCard).toBe(true);
    expect(metricStates.find((s) => s.key === 'installCommand')?.unavailableReason).toBe(
      'not-in-template'
    );
  });
});
