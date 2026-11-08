import { NextRequest } from 'next/server';
import { GitHubService } from '@/core/services/GitHubService';
import { renderCardToSvg, renderCardToPng } from '@/cards/engine/satoriRenderer';
import {
  TemplateIdSchema,
  BackgroundPatternConfigSchema,
  type CardConfig,
  type RepoMetadata,
} from '@/core/domain/schemas';
import { PRESET_PALETTES, ThemeEngine } from '@/core/theme/ThemeEngine';
import { sanitizeImageUrl } from '@/core/security/ssrf';

const githubService = new GitHubService();

interface RouteContext {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { owner, repo: rawRepo } = await params;

  // Support extensions in repo name like /api/card/owner/repo.png or repo.svg
  let repo = rawRepo;
  let inferredFormat: 'png' | 'svg' | null = null;
  if (repo.endsWith('.png')) {
    repo = repo.slice(0, -4);
    inferredFormat = 'png';
  } else if (repo.endsWith('.svg')) {
    repo = repo.slice(0, -4);
    inferredFormat = 'svg';
  }

  const { searchParams } = new URL(request.url);
  const requestedFormat = searchParams.get('format');
  const format = inferredFormat || (requestedFormat === 'svg' ? 'svg' : 'png');
  const scale = searchParams.get('scale') === '2' ? 2 : 1;
  const themeMode = searchParams.get('theme') === 'light' ? 'light' : 'dark';

  // Parse template
  const rawTemplate = searchParams.get('template');
  const templateResult = TemplateIdSchema.safeParse(rawTemplate);
  const templateId = templateResult.success ? templateResult.data : 'linear-minimal';

  // Parse background pattern
  const rawBg = searchParams.get('bg');
  const bgResult = BackgroundPatternConfigSchema.shape.id.safeParse(rawBg);
  const patternId = bgResult.success ? bgResult.data : 'architectural-grid';

  // Parse accent color
  const rawAccent = searchParams.get('accent');
  let customAccent: string | null = null;
  if (rawAccent) {
    customAccent = rawAccent.startsWith('#') ? rawAccent : `#${rawAccent}`;
  }

  // Fetch or create fallback RepoMetadata
  let repoMetadata: RepoMetadata;
  try {
    const fetched = await githubService.getRepository(owner, repo);
    // Sanitize image URLs with anti-SSRF defense
    repoMetadata = {
      ...fetched,
      owner: {
        ...fetched.owner,
        avatarUrl: sanitizeImageUrl(
          fetched.owner.avatarUrl,
          `https://avatars.githubusercontent.com/${owner}`
        ),
      },
      contributors: fetched.contributors.map((c) => ({
        ...c,
        avatarUrl: sanitizeImageUrl(
          c.avatarUrl,
          `https://avatars.githubusercontent.com/${c.login}`
        ),
      })),
    };
  } catch (error) {
    console.warn(`Fallback card rendered for ${owner}/${repo}:`, error);
    repoMetadata = {
      owner: {
        login: owner,
        avatarUrl: `https://avatars.githubusercontent.com/${owner}`,
        isOrg: false,
      },
      name: repo,
      description: 'GitHub Social Preview card generated with GitCardX',
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
  }

  // Determine Palette
  let palette =
    themeMode === 'light' ? PRESET_PALETTES['light-paper'] : PRESET_PALETTES['slate-minimal'];

  if (customAccent) {
    palette = {
      ...palette,
      accent: customAccent,
    };
  } else if (repoMetadata.primaryLanguage?.color) {
    palette = ThemeEngine.generatePaletteFromLanguageColor(
      repoMetadata.primaryLanguage.color,
      themeMode
    );
  }

  // Build CardConfig from query params with smart defaults
  const cardConfig: CardConfig = {
    templateId,
    title: searchParams.get('title') || repoMetadata.name,
    tagline:
      searchParams.get('tagline') ||
      repoMetadata.description ||
      'GitHub repository visual identity',
    installCommand: searchParams.get('command') || undefined,
    contentAlign: searchParams.get('align') === 'center' ? 'center' : 'left',
    palette,
    typography: {
      fontHeading: 'Inter',
      fontMono: 'JetBrains Mono',
    },
    backgroundPattern: {
      id: patternId,
      opacity: 0.45,
    },
    visibility: {
      stars: searchParams.get('stars') !== 'false',
      forks: searchParams.get('forks') !== 'false',
      release: searchParams.get('release') !== 'false',
      license: searchParams.get('license') !== 'false',
      contributors: searchParams.get('contributors') !== 'false',
      techStack: searchParams.get('stack') !== 'false',
      languageLogos: searchParams.get('logos') !== 'false',
      author: searchParams.get('author') !== 'false',
      tagline: searchParams.get('tagline') !== 'false',
      installCommand:
        searchParams.get('install') !== 'false' && searchParams.get('installCommand') !== 'false',
    },
  };

  const headers = {
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    'Content-Type': format === 'svg' ? 'image/svg+xml; charset=utf-8' : 'image/png',
  };

  try {
    if (format === 'svg') {
      const svg = await renderCardToSvg(repoMetadata, cardConfig);
      return new Response(svg, { status: 200, headers });
    }

    const png = await renderCardToPng(repoMetadata, cardConfig, scale);
    return new Response(new Uint8Array(png), { status: 200, headers });
  } catch (renderError) {
    console.error('Failed to render card in /api/card:', renderError);
    // Emergency inline SVG response if Satori/Resvg fails
    const fallbackSvg = `<svg width="1280" height="640" viewBox="0 0 1280 640" xmlns="http://www.w3.org/2000/svg">
      <rect width="1280" height="640" fill="#090d16"/>
      <text x="640" y="320" font-family="sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">${owner}/${repo}</text>
    </svg>`;
    return new Response(fallbackSvg, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'image/svg+xml; charset=utf-8',
      },
    });
  }
}
