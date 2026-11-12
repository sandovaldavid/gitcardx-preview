'use client';

import React, { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sliders, CreditCard, Palette } from 'lucide-react';
import { StudioHeader } from './StudioHeader';
import { LeftInspector } from './LeftInspector';
import { InteractiveCanvas } from './InteractiveCanvas';
import { RightInspector } from './RightInspector';
import { ExportModal } from './ExportModal';
import { StudioFontLoader } from './StudioFontLoader';
import { deriveConfigForRepo, StudioHydrationContext, useCardStore } from '../state/useCardStore';
import type { RepoMetadata } from '@/core/domain/schemas';
import { normalizeTemplateId } from '@/core/domain/schemas';
import { sanitizeFontFamily } from '@/cards/fonts/fontCatalog';
import { parseGitHubInput } from '@/core/domain/parser';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface StudioLayoutProps {
  initialRepo?: RepoMetadata;
  isPendingInitialRepo?: boolean;
}

const TemplateQuerySync: React.FC = () => {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');
  const repoParam = searchParams.get('repo');
  const fontHeadingParam = searchParams.get('font_heading') || searchParams.get('fontHeading');
  const fontMonoParam = searchParams.get('font_mono') || searchParams.get('fontMono');
  const setTemplateId = useCardStore((state) => state.setTemplateId);
  const updateConfig = useCardStore((state) => state.updateConfig);
  const setRepo = useCardStore((state) => state.setRepo);
  const setIsFetchingRepo = useCardStore((state) => state.setIsFetchingRepo);
  const setFetchError = useCardStore((state) => state.setFetchError);

  useIsomorphicLayoutEffect(() => {
    if (templateParam) {
      setTemplateId(normalizeTemplateId(templateParam));
    }
  }, [templateParam, setTemplateId]);

  useEffect(() => {
    if (!repoParam) return;
    const parsed = parseGitHubInput(repoParam);
    if (parsed.type !== 'repo') return;

    const currentRepo = useCardStore.getState().repo;
    const currentKey = `${currentRepo.owner.login.toLowerCase()}/${currentRepo.name.toLowerCase()}`;
    const targetKey = `${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}`;
    if (currentKey === targetKey) return;

    let aborted = false;
    const fetchRepo = async () => {
      setIsFetchingRepo(true, `${parsed.owner}/${parsed.repo}`);
      try {
        const res = await fetch(
          `/api/github/repo?owner=${encodeURIComponent(parsed.owner)}&repo=${encodeURIComponent(parsed.repo)}`
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Repository not found');
        }
        const data = await res.json();
        if (!aborted) {
          setRepo(data, true);
        }
      } catch (err) {
        if (!aborted) {
          setFetchError(err instanceof Error ? err.message : 'Failed to load repository');
        }
      } finally {
        if (!aborted) {
          setIsFetchingRepo(false);
        }
      }
    };

    fetchRepo();
    return () => {
      aborted = true;
    };
  }, [repoParam, setIsFetchingRepo, setRepo, setFetchError]);

  useIsomorphicLayoutEffect(() => {
    if (!fontHeadingParam && !fontMonoParam) return;
    const current = useCardStore.getState().config.typography;
    const nextHeading = fontHeadingParam
      ? sanitizeFontFamily(fontHeadingParam, current.fontHeading)
      : current.fontHeading;
    const nextMono = fontMonoParam
      ? sanitizeFontFamily(fontMonoParam, current.fontMono)
      : current.fontMono;
    if (nextHeading !== current.fontHeading || nextMono !== current.fontMono) {
      updateConfig({
        typography: {
          fontHeading: nextHeading,
          fontMono: nextMono,
        },
      });
    }
  }, [fontHeadingParam, fontMonoParam, updateConfig]);

  return null;
};

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  initialRepo,
  isPendingInitialRepo = false,
}) => {
  const storeConfig = useCardStore((state) => state.config);
  const hydratedRouteKey = useCardStore((state) => state.hydratedRouteKey);
  const hydrateRepo = useCardStore((state) => state.hydrateRepo);

  const initialRepoKey = initialRepo
    ? `${initialRepo.owner.login.toLowerCase()}/${initialRepo.name.toLowerCase()}`
    : null;
  const needsInitialHydration = Boolean(
    initialRepo && initialRepoKey && hydratedRouteKey !== initialRepoKey
  );

  const hydrationValue = useMemo(() => {
    if (needsInitialHydration && initialRepo) {
      return {
        repo: initialRepo,
        config: deriveConfigForRepo(initialRepo, storeConfig, { autoTheme: true }),
        isPendingInitialRepo: false,
      };
    }

    if (isPendingInitialRepo) {
      return {
        isPendingInitialRepo: true,
      };
    }

    return null;
  }, [needsInitialHydration, initialRepo, storeConfig, isPendingInitialRepo]);

  useIsomorphicLayoutEffect(() => {
    if (initialRepo && needsInitialHydration) {
      hydrateRepo(initialRepo, { autoTheme: true });
    }
  }, [initialRepo, needsInitialHydration, hydrateRepo]);

  const [mobileTab, setMobileTab] = useState<'content' | 'canvas' | 'design'>('canvas');

  return (
    <StudioHydrationContext.Provider value={hydrationValue}>
      <StudioFontLoader />
      <Suspense fallback={null}>
        <TemplateQuerySync />
      </Suspense>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
        <StudioHeader />
        <div
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 overflow-hidden relative outline-none"
        >
          <div
            className={`${
              mobileTab === 'content' ? 'flex w-full' : 'hidden'
            } lg:flex lg:w-auto shrink-0 z-20`}
          >
            <LeftInspector />
          </div>
          <div
            className={`${
              mobileTab === 'canvas' ? 'flex' : 'hidden'
            } lg:flex flex-1 min-w-0 relative`}
          >
            <InteractiveCanvas />
          </div>
          <div
            className={`${
              mobileTab === 'design' ? 'flex w-full' : 'hidden'
            } lg:flex lg:w-auto shrink-0 z-20`}
          >
            <RightInspector />
          </div>
        </div>

        {/* Mobile Tab Bar (< lg) */}
        <nav
          aria-label="Studio View Navigation"
          className="lg:hidden flex items-center justify-around border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-2 py-1.5 z-30 shrink-0"
        >
          <button
            type="button"
            onClick={() => setMobileTab('content')}
            aria-pressed={mobileTab === 'content'}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              mobileTab === 'content'
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Content</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('canvas')}
            aria-pressed={mobileTab === 'canvas'}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              mobileTab === 'canvas'
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('design')}
            aria-pressed={mobileTab === 'design'}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              mobileTab === 'design'
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Design</span>
          </button>
        </nav>

        <ExportModal />
      </div>
    </StudioHydrationContext.Provider>
  );
};
