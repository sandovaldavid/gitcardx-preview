import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  applyCardUrlParamsToConfig,
  buildCardImageUrl,
  buildCardQueryParams,
  buildStudioShareUrl,
  findMatchingPresetPalette,
  getNonShareableCustomAssets,
  parseCardConfigFromSearchParams,
  parseColorParam,
} from '@/core/domain/cardUrl';
import type { CardConfig, RepoMetadata } from '@/core/domain/schemas';
import { PRESET_PALETTES, ThemeEngine } from '@/core/theme/ThemeEngine';
import { renderCardToSvg } from '@/cards/engine/satoriRenderer';

const sampleRepo: RepoMetadata = {
  owner: {
    login: 'sandovaldavid',
    avatarUrl: 'https://avatars.githubusercontent.com/u/102970701',
    isOrg: false,
  },
  name: 'gitframe',
  description: 'Instant GitHub Social Preview & README hero cards.',
  homepageUrl: 'https://gitframe.dev',
  stars: 120,
  forks: 14,
  primaryLanguage: { name: 'TypeScript', color: '#3178C6' },
  languages: [
    { name: 'TypeScript', color: '#3178C6', size: 80000 },
    { name: 'CSS', color: '#1572B6', size: 20000 },
  ],
  topics: ['nextjs', 'satori', 'github'],
  license: 'FSL-1.1-MIT',
  latestRelease: { tag: 'v1.2.0', publishedAt: '2026-11-01T00:00:00Z' },
  contributors: [
    { login: 'sandovaldavid', avatarUrl: 'https://avatars.githubusercontent.com/u/102970701' },
  ],
};

function makeStudioConfig(overrides: Partial<CardConfig> = {}): CardConfig {
  return {
    templateId: 'terminal-prompt',
    title: 'Gitframe CLI (Next.js)',
    tagline: 'Generate cards quickly (zero config) & embed anywhere.',
    installCommand: 'bunx gitframe@latest',
    contentAlign: 'center',
    palette: {
      ...PRESET_PALETTES.nord,
    },
    typography: {
      fontHeading: 'Outfit',
      fontMono: 'Space Mono',
    },
    backgroundPattern: {
      id: 'dot-matrix',
      opacity: 0.35,
      scale: 1.5,
      color: '#88c0d0',
    },
    visibility: {
      stars: true,
      forks: false,
      release: false,
      license: true,
      contributors: false,
      techStack: true,
      languageLogos: true,
      author: true,
      tagline: true,
      installCommand: true,
      issues: true,
      discussions: false,
    },
    customLogoUrl: 'https://raw.githubusercontent.com/sandovaldavid/gitframe/main/src/app/icon.svg',
    ...overrides,
  };
}

describe('cardUrl codec (Studio <-> API <-> README parity)', () => {
  it('round-trips a customized Studio CardConfig through buildCardImageUrl and produces matching Satori SVG', async () => {
    const studioConfig = makeStudioConfig();
    const imageUrl = buildCardImageUrl(
      'https://gitframe.dev',
      'sandovaldavid',
      'gitframe',
      studioConfig,
      sampleRepo
    );

    const parsedUrl = new URL(imageUrl);
    expect(parsedUrl.pathname).toBe('/api/card/sandovaldavid/gitframe.png');
    expect(parsedUrl.searchParams.get('template')).toBe('terminal-prompt');
    expect(parsedUrl.searchParams.get('preset')).toBe('nord');
    expect(parsedUrl.searchParams.get('title')).toBe(studioConfig.title);
    expect(parsedUrl.searchParams.get('tagline')).toBe(studioConfig.tagline);
    expect(parsedUrl.searchParams.get('command')).toBe(studioConfig.installCommand);
    expect(parsedUrl.searchParams.get('align')).toBe('center');
    expect(parsedUrl.searchParams.get('forks')).toBe('false');
    expect(parsedUrl.searchParams.get('issues')).toBe('true');

    // Escapes ASCII parentheses so Markdown links never truncate prematurely
    expect(imageUrl).toContain('%28Next.js%29');
    expect(imageUrl).toContain('%28zero+config%29');

    const parsedConfig = parseCardConfigFromSearchParams(parsedUrl.searchParams, sampleRepo);
    expect(parsedConfig).toEqual(studioConfig);

    const studioSvg = await renderCardToSvg(sampleRepo, studioConfig);
    const apiSvg = await renderCardToSvg(sampleRepo, parsedConfig);
    expect(apiSvg).toBe(studioSvg);
  });

  it('round-trips arbitrary custom hex palettes without dropping background, text or border', () => {
    const customConfig = makeStudioConfig({
      palette: {
        background: '#112233',
        text: '#eeeeee',
        accent: '#ff6600',
        border: '#445566',
      },
    });

    const params = buildCardQueryParams(customConfig, sampleRepo);
    expect(params.get('preset')).toBeNull();
    expect(params.get('pbg')).toBe('112233');
    expect(params.get('ptext')).toBe('eeeeee');
    expect(params.get('accent')).toBe('ff6600');
    expect(params.get('pborder')).toBe('445566');

    const reparsed = parseCardConfigFromSearchParams(params, sampleRepo);
    expect(reparsed.palette).toEqual(customConfig.palette);
    expect(ThemeEngine.isLightColor(reparsed.palette.background)).toBe(false);
  });

  it('builds dark & light adaptive README picture variants while preserving non-palette customizations', () => {
    const studioConfig = makeStudioConfig({
      palette: { ...PRESET_PALETTES['light-paper'] },
      visibility: {
        ...makeStudioConfig().visibility,
        tagline: false,
      },
    });

    const lightVariantUrl = new URL(
      buildCardImageUrl(
        'https://gitframe.dev',
        'sandovaldavid',
        'gitframe',
        studioConfig,
        sampleRepo,
        {
          variant: 'light',
        }
      )
    );
    const darkVariantUrl = new URL(
      buildCardImageUrl(
        'https://gitframe.dev',
        'sandovaldavid',
        'gitframe',
        studioConfig,
        sampleRepo,
        {
          variant: 'dark',
        }
      )
    );

    // Since studio palette is already light-paper, light variant keeps preset=light-paper,
    // while dark variant switches theme to dark slate and clears preset=light-paper.
    expect(lightVariantUrl.searchParams.get('preset')).toBe('light-paper');
    expect(lightVariantUrl.searchParams.get('theme')).toBe('light');
    expect(darkVariantUrl.searchParams.get('theme')).toBe('dark');
    expect(darkVariantUrl.searchParams.get('preset')).toBeNull();
    expect(darkVariantUrl.searchParams.get('pbg')).toBeNull();

    // Custom tagline text + hidden toggle survive independently without ?tagline=false collision
    expect(darkVariantUrl.searchParams.get('tagline')).toBe(studioConfig.tagline);
    expect(darkVariantUrl.searchParams.get('show_tagline')).toBe('false');

    const reparsedDark = parseCardConfigFromSearchParams(darkVariantUrl.searchParams, sampleRepo);
    expect(reparsedDark.tagline).toBe(studioConfig.tagline);
    expect(reparsedDark.visibility.tagline).toBe(false);
    expect(ThemeEngine.isLightColor(reparsedDark.palette.background)).toBe(false);
  });

  it('parses rgb(...) color parameters cleanly without corrupting with leading #', () => {
    expect(parseColorParam('rgb(15, 23, 42)')).toBe('rgb(15, 23, 42)');
    expect(parseColorParam('ff5500')).toBe('#ff5500');
    expect(parseColorParam('#ff5500')).toBe('#ff5500');
  });

  it('identifies preset palettes case-insensitively', () => {
    expect(
      findMatchingPresetPalette({
        background: '#2E3440',
        text: '#ECEFF4',
        accent: '#88C0D0',
        border: '#434C5E',
      })
    ).toBe('nord');
  });

  it('detects non-shareable custom data-URI or unhosted assets for ExportModal warnings', () => {
    const inlineLogoConfig = makeStudioConfig({
      customLogoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANS',
      customBackgroundUrl: 'https://raw.githubusercontent.com/sandovaldavid/gitframe/main/bg.png',
    });
    expect(getNonShareableCustomAssets(inlineLogoConfig)).toEqual(['logo']);

    const cleanConfig = makeStudioConfig({
      customLogoUrl:
        'https://raw.githubusercontent.com/sandovaldavid/gitframe/main/src/app/icon.svg',
      customBackgroundUrl: 'https://avatars.githubusercontent.com/u/102970701',
    });
    expect(getNonShareableCustomAssets(cleanConfig)).toEqual([]);
  });

  it('restores a complete Studio composition from buildStudioShareUrl via applyCardUrlParamsToConfig', () => {
    const customized = makeStudioConfig({
      templateId: 'blueprint-grid',
      palette: { ...PRESET_PALETTES['catppuccin-mocha'] },
      backgroundPattern: {
        id: 'architectural-grid',
        opacity: 0.6,
        scale: 1.25,
        color: '#cba6f7',
      },
      typography: {
        fontHeading: 'Space Grotesk',
        fontMono: 'Fira Code',
      },
    });

    const shareUrl = buildStudioShareUrl(
      'https://gitframe.dev',
      'sandovaldavid',
      'gitframe',
      customized,
      sampleRepo,
      { ref: 'readme' }
    );
    const parsedShareUrl = new URL(shareUrl);
    expect(parsedShareUrl.pathname).toBe('/sandovaldavid/gitframe');
    expect(parsedShareUrl.searchParams.get('ref')).toBe('readme');

    const defaultStudioConfig: CardConfig = {
      templateId: 'modern-minimal',
      title: sampleRepo.name,
      tagline: sampleRepo.description ?? '',
      installCommand: '',
      contentAlign: 'left',
      palette: { ...PRESET_PALETTES['slate-minimal'] },
      typography: {
        fontHeading: 'Inter',
        fontMono: 'JetBrains Mono',
      },
      backgroundPattern: { id: 'aurora-mesh', opacity: 0.45, scale: 1 },
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
        issues: false,
        discussions: false,
      },
    };

    const hydrated = applyCardUrlParamsToConfig(
      defaultStudioConfig,
      parsedShareUrl.searchParams,
      sampleRepo
    );
    expect(hydrated).toEqual(customized);
  });

  it('keeps an ICO favicon at root src/app/favicon.ico for raw API browser tabs', () => {
    const faviconPath = path.join(process.cwd(), 'src/app/favicon.ico');
    expect(fs.existsSync(faviconPath)).toBe(true);
    const bytes = fs.readFileSync(faviconPath);
    // Standard ICO header: reserved=0x0000, type=0x0001, image count >= 1
    expect(bytes.subarray(0, 4)).toEqual(Buffer.from([0x00, 0x00, 0x01, 0x00]));
    expect(bytes.readUInt16LE(4)).toBeGreaterThanOrEqual(1);
  });
});
