'use client';

import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { applyCardUrlParamsToConfig } from '@/core/domain/cardUrl';
import { parseGitHubInput } from '@/core/domain/parser';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface StudioLayoutProps {
  initialRepo?: RepoMetadata;
  isPendingInitialRepo?: boolean;
}

const TemplateQuerySync: React.FC<{ expectedRouteKey: string | null }> = ({ expectedRouteKey }) => {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const repoParam = searchParams.get('repo');
  const hydratedRouteKey = useCardStore((state) => state.hydratedRouteKey);
  const currentRepo = useCardStore((state) => state.repo);
  const currentRepoKey = `${currentRepo.owner.login.toLowerCase()}/${currentRepo.name.toLowerCase()}`;
  const setRepo = useCardStore((state) => state.setRepo);
  const syncDefaultRepoMetadata = useCardStore((state) => state.syncDefaultRepoMetadata);
  const setIsFetchingRepo = useCardStore((state) => state.setIsFetchingRepo);
  const setFetchError = useCardStore((state) => state.setFetchError);
  const lastAppliedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!repoParam) return;
    const parsed = parseGitHubInput(repoParam);
    if (parsed.type !== 'repo') return;

    const latestRepo = useCardStore.getState().repo;
    const latestKey = `${latestRepo.owner.login.toLowerCase()}/${latestRepo.name.toLowerCase()}`;
    const targetKey = `${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}`;
    if (latestKey === targetKey) return;

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

  useEffect(() => {
    if (expectedRouteKey || repoParam) return;
    const { hasCustomRepo, hydratedRouteKey: routeKey } = useCardStore.getState();
    if (hasCustomRepo || routeKey) return;

    let aborted = false;
    const syncDefaultRepo = async () => {
      try {
        const res = await fetch('/api/github/repo?owner=sandovaldavid&repo=gitframe');
        if (!res.ok) return;
        const data = (await res.json()) as RepoMetadata;
        if (!aborted) {
          syncDefaultRepoMetadata(data);
        }
      } catch {
        // Keep static DEFAULT_REPO fallback if network/GitHub API is unreachable.
      }
    };

    syncDefaultRepo();
    return () => {
      aborted = true;
    };
  }, [expectedRouteKey, repoParam, syncDefaultRepoMetadata]);

  useIsomorphicLayoutEffect(() => {
    if (!searchString) {
      lastAppliedSignatureRef.current = null;
      return;
    }

    // Wait for initial route hydration so URL overrides layer on top of the hydrated repo config
    if (expectedRouteKey && hydratedRouteKey !== expectedRouteKey) {
      return;
    }

    const signature = `${hydratedRouteKey ?? 'studio'}::${currentRepoKey}::${searchString}`;
    if (lastAppliedSignatureRef.current === signature) {
      return;
    }
    lastAppliedSignatureRef.current = signature;

    const params = new URLSearchParams(searchString);
    const state = useCardStore.getState();
    const nextConfig = applyCardUrlParamsToConfig(state.config, params, state.repo);
    useCardStore.setState({ config: nextConfig });
  }, [searchString, expectedRouteKey, hydratedRouteKey, currentRepoKey]);

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
        <TemplateQuerySync expectedRouteKey={initialRepoKey} />
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
