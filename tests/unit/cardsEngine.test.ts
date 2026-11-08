import { describe, it, expect } from 'vitest';
import { getCardFonts } from '@/cards/fonts/fontLoader';
import { renderCardToSvg, renderCardToPng } from '@/cards/engine/satoriRenderer';
import { CARD_TEMPLATES } from '@/cards/templates/CardTemplateRegistry';
import type { RepoMetadata, CardConfig, TemplateId } from '@/core/domain/schemas';

const mockRepo: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
    isOrg: false,
  },
  name: 'gitcardx-preview',
  description: 'Instant 5-second GitHub Social Preview card generator for developers.',
  homepageUrl: 'https://gitcardx.dev',
  stars: 1250,
  forks: 180,
  primaryLanguage: {
    name: 'TypeScript',
    color: '#3178C6',
  },
  languages: [
    { name: 'TypeScript', color: '#3178C6', size: 85000 },
    { name: 'CSS', color: '#1572B6', size: 15000 },
  ],
  topics: ['nextjs', 'social-preview', 'developer-tools', 'react'],
  license: 'MIT',
  latestRelease: {
    tag: 'v1.0.0',
    publishedAt: '2026-11-01T12:00:00Z',
  },
  contributors: [
    { login: 'sandovaldavid', avatarUrl: 'https://avatars.githubusercontent.com/u/12345' },
    { login: 'octocat', avatarUrl: 'https://avatars.githubusercontent.com/u/583231' },
  ],
};

const baseConfig: CardConfig = {
  templateId: 'linear-minimal',
  title: 'GitCardX Preview',
  tagline: 'Give your GitHub repository a memorable visual identity.',
  installCommand: 'bun add gitcardx-preview',
  palette: {
    background: '#0a0a0a',
    text: '#ffffff',
    accent: '#3b82f6',
    border: '#262626',
  },
  typography: {
    fontHeading: 'Inter',
    fontMono: 'JetBrains Mono',
  },
  backgroundPattern: {
    id: 'architectural-grid',
    opacity: 0.4,
  },
  visibility: {
    stars: true,
    forks: true,
    release: true,
    license: true,
    contributors: true,
    techStack: true,
  },
};

describe('Cards Engine & Satori Renderer', () => {
  it('loads valid font buffers for Inter and JetBrains Mono', async () => {
    const fonts = await getCardFonts();
    expect(fonts.length).toBe(4);
    for (const font of fonts) {
      expect(font.data.byteLength).toBeGreaterThan(10000);
      expect(['Inter', 'JetBrains Mono']).toContain(font.name);
    }
  });

  describe('8 Card Templates rendering in Satori', () => {
    const templateIds = Object.keys(CARD_TEMPLATES) as TemplateId[];

    for (const templateId of templateIds) {
      it(`renders template '${templateId}' to valid SVG`, async () => {
        const config: CardConfig = {
          ...baseConfig,
          templateId,
        };

        const svg = await renderCardToSvg(mockRepo, config);

        expect(svg).toBeDefined();
        expect(typeof svg).toBe('string');
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('viewBox="0 0 1280 640"');
        expect(svg).toContain('width="1280"');
        expect(svg).toContain('height="640"');
        expect(svg.length).toBeGreaterThan(500);
      });
    }
  });

  describe('Procedural background patterns in Satori', () => {
    const backgroundPatterns = [
      'architectural-grid',
      'dot-matrix',
      'radial-spotlight',
      'aurora-mesh',
      'topographic-contours',
      'custom-image',
    ] as const;

    for (const patternId of backgroundPatterns) {
      it(`renders with background pattern '${patternId}'`, async () => {
        const config: CardConfig = {
          ...baseConfig,
          backgroundPattern: {
            id: patternId,
            opacity: 0.5,
          },
        };

        const svg = await renderCardToSvg(mockRepo, config);
        expect(svg.startsWith('<svg')).toBe(true);
      });
    }
  });

  it('renders to PNG using Resvg with valid PNG signature', async () => {
    const png = await renderCardToPng(mockRepo, baseConfig, 1);
    expect(png).toBeInstanceOf(Buffer);
    expect(png.length).toBeGreaterThan(1000);

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50);
    expect(png[2]).toBe(0x4e);
    expect(png[3]).toBe(0x47);
  });

  it('handles edge case repositories (no release, no license, empty topics, long title)', async () => {
    const edgeRepo: RepoMetadata = {
      owner: {
        login: 'edge-tester',
        avatarUrl: 'https://avatars.githubusercontent.com/u/99999',
        isOrg: true,
      },
      name: 'super-long-repository-name-that-might-overflow-if-not-handled-properly-in-flex-container',
      description: null,
      homepageUrl: null,
      stars: 0,
      forks: 0,
      primaryLanguage: null,
      languages: [],
      topics: [],
      license: null,
      latestRelease: null,
      contributors: [],
    };

    const edgeConfig: CardConfig = {
      ...baseConfig,
      templateId: 'cli-terminal',
      title:
        'Very Long Title For A Package Repository That Tests Wrapping In Satori Flexbox Layout',
      tagline: '',
    };

    const svg = await renderCardToSvg(edgeRepo, edgeConfig);
    expect(svg.startsWith('<svg')).toBe(true);
  });
});
