import { describe, it, expect } from 'vitest';
import { getCardFonts } from '@/cards/fonts/fontLoader';
import { renderCardToSvg, renderCardToPng } from '@/cards/engine/satoriRenderer';
import { getLanguageLogo } from '@/cards/icons/languageLogos';
import { CARD_TEMPLATES } from '@/cards/templates/CardTemplateRegistry';
import type { RepoMetadata, CardConfig, TemplateId } from '@/core/domain/schemas';

const mockRepo: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
    isOrg: false,
  },
  name: 'gitframe',
  description: 'Instant 5-second GitHub Social Preview card generator for developers.',
  homepageUrl: 'https://gitframe.dev',
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
  title: 'Gitframe',
  tagline: 'Give your GitHub repository a memorable visual identity.',
  installCommand: 'bun add gitframe',
  contentAlign: 'left',
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
    languageLogos: true,
    author: true,
    tagline: true,
    installCommand: true,
  },
};

describe('Cards Engine & Satori Renderer', () => {
  it('loads valid font buffers for all supported font pairings', async () => {
    const fonts = await getCardFonts();
    expect(fonts.length).toBe(12);
    const expectedFamilies = [
      'Inter',
      'Geist',
      'Space Grotesk',
      'Plus Jakarta Sans',
      'JetBrains Mono',
      'Fira Code',
    ];
    for (const font of fonts) {
      expect(font.data.byteLength).toBeGreaterThan(10000);
      expect(expectedFamilies).toContain(font.name);
    }
  });

  it('renders SVG with custom typography fonts (Space Grotesk & Fira Code)', async () => {
    const customFontConfig: CardConfig = {
      ...baseConfig,
      typography: {
        fontHeading: 'Space Grotesk',
        fontMono: 'Fira Code',
      },
    };
    const svg = await renderCardToSvg(mockRepo, customFontConfig);
    expect(svg).toBeDefined();
    expect(svg.startsWith('<svg')).toBe(true);
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

    it('renders with custom-image background pattern using customBackgroundUrl and scale', async () => {
      const validPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const configWithCustomBg: CardConfig = {
        ...baseConfig,
        customBackgroundUrl: validPng,
        backgroundPattern: {
          id: 'custom-image',
          opacity: 0.75,
          scale: 1.5,
        },
      };

      const svg = await renderCardToSvg(mockRepo, configWithCustomBg);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain(validPng);
    });

    it('renders scaled architectural-grid and dot-matrix patterns', async () => {
      const scaledGrid: CardConfig = {
        ...baseConfig,
        backgroundPattern: {
          id: 'architectural-grid',
          opacity: 0.5,
          scale: 2,
        },
      };
      const svgGrid = await renderCardToSvg(mockRepo, scaledGrid);
      expect(svgGrid).toContain('arch-large-grid');
      expect(svgGrid).toContain('width=%22320%22');

      const scaledDots: CardConfig = {
        ...baseConfig,
        backgroundPattern: {
          id: 'dot-matrix',
          opacity: 0.5,
          scale: 2,
        },
      };
      const svgDots = await renderCardToSvg(mockRepo, scaledDots);
      expect(svgDots).toContain('dot-matrix-pattern');
      expect(svgDots).toContain('width=%2264%22');
    });

    it('renders pattern with custom color override', async () => {
      const coloredGrid: CardConfig = {
        ...baseConfig,
        backgroundPattern: {
          id: 'architectural-grid',
          opacity: 0.6,
          scale: 1,
          color: '#00ffcc',
        },
      };
      const svg = await renderCardToSvg(mockRepo, coloredGrid);
      expect(svg).toContain('%2300ffcc');
    });

    it('dynamically renders chosen background patterns in aurora-mesh and blueprint-grid templates', async () => {
      const auroraWithDots: CardConfig = {
        ...baseConfig,
        templateId: 'aurora-mesh',
        backgroundPattern: {
          id: 'dot-matrix',
          opacity: 0.8,
        },
      };

      const svgAurora = await renderCardToSvg(mockRepo, auroraWithDots);
      expect(svgAurora).toContain('dot-matrix-pattern');

      const blueprintWithSpotlight: CardConfig = {
        ...baseConfig,
        templateId: 'blueprint-grid',
        backgroundPattern: {
          id: 'radial-spotlight',
          opacity: 0.6,
        },
      };

      const svgBlueprint = await renderCardToSvg(mockRepo, blueprintWithSpotlight);
      expect(svgBlueprint).toContain('spotlight-primary');
    });
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

  it('renders official technology logos when languageLogos flag is true', async () => {
    const configWithLogos: CardConfig = {
      ...baseConfig,
      templateId: 'linear-minimal',
      visibility: {
        ...baseConfig.visibility,
        languageLogos: true,
      },
    };

    const svg = await renderCardToSvg(mockRepo, configWithLogos);
    const tsLogo = getLanguageLogo('TypeScript');
    expect(tsLogo).not.toBeNull();
    expect(svg).toContain(tsLogo!.dataUri);
  });

  it('omits official technology logos when languageLogos flag is false', async () => {
    const configWithoutLogos: CardConfig = {
      ...baseConfig,
      templateId: 'linear-minimal',
      visibility: {
        ...baseConfig.visibility,
        languageLogos: false,
      },
    };

    const svg = await renderCardToSvg(mockRepo, configWithoutLogos);
    const tsLogo = getLanguageLogo('TypeScript');
    expect(tsLogo).not.toBeNull();
    // When flag is false, official logo data URI is not rendered
    expect(svg).not.toContain(tsLogo!.dataUri);
  });

  it('renders release-spotlight with real release and handles repos without release accurately', async () => {
    // 1. Repo with real release v2.0.1
    const repoWithRelease: RepoMetadata = {
      ...mockRepo,
      latestRelease: { tag: 'v2.0.1', publishedAt: '2026-11-05T13:00:09Z' },
    };
    const configSpotlight: CardConfig = {
      ...baseConfig,
      templateId: 'release-spotlight',
    };
    const svgRelease = await renderCardToSvg(repoWithRelease, configSpotlight);
    expect(svgRelease.startsWith('<svg')).toBe(true);
    expect(svgRelease).toContain('width="1280"');
    expect(svgRelease).toContain('height="640"');

    // 2. Repo without release (renders cleanly without throwing)
    const repoNoRelease: RepoMetadata = {
      ...mockRepo,
      latestRelease: null,
    };
    const svgNoRelease = await renderCardToSvg(repoNoRelease, configSpotlight);
    expect(svgNoRelease.startsWith('<svg')).toBe(true);
    expect(svgNoRelease).toContain('width="1280"');
    expect(svgNoRelease).toContain('height="640"');
  });

  it('renders all 8 templates within exact 1280x640 bounds without cropping or box-sizing overflow', async () => {
    const templates = [
      'linear-minimal',
      'cli-terminal',
      'oss-credibility',
      'sdk-package',
      'aurora-mesh',
      'blueprint-grid',
      'release-spotlight',
      'creator-signature',
    ] as const;

    for (const templateId of templates) {
      const config: CardConfig = {
        ...baseConfig,
        templateId,
      };

      const svg = await renderCardToSvg(mockRepo, config);

      // SVG must have exact root viewBox and root rect 1280x640
      expect(svg).toContain('viewBox="0 0 1280 640"');
      expect(svg).toContain('<rect x="0" y="0" width="1280" height="640"');

      // Crucial: Must NEVER contain oversized content-box overflow from padding (1392, 1400, 1376, 752, 760)
      expect(svg).not.toContain('width="1392"');
      expect(svg).not.toContain('width="1400"');
      expect(svg).not.toContain('width="1376"');
      expect(svg).not.toContain('height="752"');
      expect(svg).not.toContain('height="760"');
      expect(svg).not.toContain('height="736"');

      // Coordinates must stay within viewport bounds
      const xMatches = [...svg.matchAll(/x="([0-9.]+)"/g)].map((m) => parseFloat(m[1]));
      const yMatches = [...svg.matchAll(/y="([0-9.]+)"/g)].map((m) => parseFloat(m[1]));

      const maxX = Math.max(...xMatches);
      const maxY = Math.max(...yMatches);

      expect(maxX).toBeLessThanOrEqual(1280);
      expect(maxY).toBeLessThanOrEqual(640);
    }
  });

  it('renders all 8 templates with contentAlign: "center" without overflow', async () => {
    const templates = [
      'linear-minimal',
      'cli-terminal',
      'oss-credibility',
      'sdk-package',
      'aurora-mesh',
      'blueprint-grid',
      'release-spotlight',
      'creator-signature',
    ] as const;

    for (const templateId of templates) {
      const config: CardConfig = {
        ...baseConfig,
        templateId,
        contentAlign: 'center',
      };

      const svg = await renderCardToSvg(mockRepo, config);

      expect(svg).toContain('viewBox="0 0 1280 640"');
      expect(svg).toContain('<rect x="0" y="0" width="1280" height="640"');

      const xMatches = [...svg.matchAll(/x="([0-9.]+)"/g)].map((m) => parseFloat(m[1]));
      const yMatches = [...svg.matchAll(/y="([0-9.]+)"/g)].map((m) => parseFloat(m[1]));

      const maxX = Math.max(...xMatches);
      const maxY = Math.max(...yMatches);

      expect(maxX).toBeLessThanOrEqual(1280);
      expect(maxY).toBeLessThanOrEqual(640);
    }
  });

  it('hides author and tagline elements when visibility toggles are false', async () => {
    const configHidden: CardConfig = {
      ...baseConfig,
      templateId: 'linear-minimal',
      visibility: {
        ...baseConfig.visibility,
        author: false,
        tagline: false,
      },
    };

    const svg = await renderCardToSvg(mockRepo, configHidden);
    expect(svg).not.toContain(mockRepo.owner.login);
    expect(svg).not.toContain('Give your GitHub repository a memorable visual identity.');
  });

  it('hides install command terminal when installCommand visibility is false', async () => {
    const configWithoutInstall: CardConfig = {
      ...baseConfig,
      templateId: 'cli-terminal',
      installCommand: 'bun add custom-test-cli',
      visibility: {
        ...baseConfig.visibility,
        installCommand: false,
      },
    };

    const svg = await renderCardToSvg(mockRepo, configWithoutInstall);
    // TerminalWindow's traffic light dot (#ef4444) is omitted when installCommand is false
    expect(svg).not.toContain('#ef4444');
  });

  it('renders install command terminal when installCommand visibility is true', async () => {
    const configWithInstall: CardConfig = {
      ...baseConfig,
      templateId: 'cli-terminal',
      installCommand: 'bun add custom-test-cli',
      visibility: {
        ...baseConfig.visibility,
        installCommand: true,
      },
    };

    const svg = await renderCardToSvg(mockRepo, configWithInstall);
    // TerminalWindow's traffic light dot (#ef4444) is rendered when installCommand is true
    expect(svg).toContain('#ef4444');
  });

  it('renders title accent formatting with *keyword* across templates', async () => {
    const configAccent: CardConfig = {
      ...baseConfig,
      templateId: 'linear-minimal',
      title: 'GitCardX *Instant* Cards',
      palette: {
        ...baseConfig.palette,
        accent: '#f43f5e',
      },
    };

    const svg = await renderCardToSvg(mockRepo, configAccent);
    // Satori compiles the accented word into an SVG path filled with the accent color
    expect(svg).toContain('fill="#f43f5e"');
    expect(svg).toContain('viewBox="0 0 1280 640"');
  });
});
