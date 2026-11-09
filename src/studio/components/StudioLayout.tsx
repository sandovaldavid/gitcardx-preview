'use client';

import React, { Suspense, useEffect, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface StudioLayoutProps {
  initialRepo?: RepoMetadata;
  isPendingInitialRepo?: boolean;
}

const TemplateQuerySync: React.FC = () => {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');
  const fontHeadingParam = searchParams.get('font_heading') || searchParams.get('fontHeading');
  const fontMonoParam = searchParams.get('font_mono') || searchParams.get('fontMono');
  const setTemplateId = useCardStore((state) => state.setTemplateId);
  const updateConfig = useCardStore((state) => state.updateConfig);

  useIsomorphicLayoutEffect(() => {
    if (templateParam) {
      setTemplateId(normalizeTemplateId(templateParam));
    }
  }, [templateParam, setTemplateId]);

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

  return (
    <StudioHydrationContext.Provider value={hydrationValue}>
      <StudioFontLoader />
      <Suspense fallback={null}>
        <TemplateQuerySync />
      </Suspense>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
        <StudioHeader />
        <div className="flex flex-1 overflow-hidden relative">
          <LeftInspector />
          <InteractiveCanvas />
          <RightInspector />
        </div>
        <ExportModal />
      </div>
    </StudioHydrationContext.Provider>
  );
};
