import { NextRequest, NextResponse } from 'next/server';
import { renderCardToPng, renderCardToSvg } from '@/cards/engine/satoriRenderer';
import { RepoMetadataSchema, CardConfigSchema, type CardConfig } from '@/core/domain/schemas';
import { sanitizeImageUrl } from '@/core/security/ssrf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo, config, format = 'png', scale = 1 } = body;

    const parsedRepo = RepoMetadataSchema.safeParse(repo);
    const parsedConfig = CardConfigSchema.safeParse(config);

    if (!parsedRepo.success || !parsedConfig.success) {
      return NextResponse.json(
        {
          error: 'Invalid card configuration or repository metadata payload',
          details: {
            repoErrors: parsedRepo.error?.issues,
            configErrors: parsedConfig.error?.issues,
          },
        },
        { status: 400 }
      );
    }

    const safeRepo = {
      ...parsedRepo.data,
      owner: {
        ...parsedRepo.data.owner,
        avatarUrl: sanitizeImageUrl(
          parsedRepo.data.owner.avatarUrl,
          `https://avatars.githubusercontent.com/${parsedRepo.data.owner.login}`
        ),
      },
      contributors: parsedRepo.data.contributors.map((c) => ({
        ...c,
        avatarUrl: sanitizeImageUrl(
          c.avatarUrl,
          `https://avatars.githubusercontent.com/${c.login}`
        ),
      })),
    };

    const sanitizedLogo = parsedConfig.data.customLogoUrl
      ? sanitizeImageUrl(parsedConfig.data.customLogoUrl) || undefined
      : undefined;
    const sanitizedBg = parsedConfig.data.customBackgroundUrl
      ? sanitizeImageUrl(parsedConfig.data.customBackgroundUrl) || undefined
      : undefined;

    const safeConfig: CardConfig = {
      ...parsedConfig.data,
      customLogoUrl: sanitizedLogo,
      customBackgroundUrl: sanitizedBg,
    };
    const isSvg = format === 'svg';
    const numericScale = Math.min(Math.max(Number(scale) || 1, 1), 3);

    if (isSvg) {
      const svg = await renderCardToSvg(safeRepo, safeConfig);
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    const png = await renderCardToPng(safeRepo, safeConfig, numericScale);
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    console.error('Failed to render card on-demand:', error);
    const message = error instanceof Error ? error.message : 'Unknown render error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
