'use client';

import React, { Suspense, useEffect, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { StudioHeader } from './StudioHeader';
import { LeftInspector } from './LeftInspector';
import { InteractiveCanvas } from './InteractiveCanvas';
import { RightInspector } from './RightInspector';
import { ExportModal } from './ExportModal';
import { deriveConfigForRepo, StudioHydrationContext, useCardStore } from '../state/useCardStore';
import type { RepoMetadata } from '@/core/domain/schemas';
import { normalizeTemplateId } from '@/core/domain/schemas';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface StudioLayoutProps {
  initialRepo?: RepoMetadata;
  isPendingInitialRepo?: boolean;
}

const TemplateQuerySync: React.FC = () => {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');
  const setTemplateId = useCardStore((state) => state.setTemplateId);

  useIsomorphicLayoutEffect(() => {
    if (templateParam) {
      setTemplateId(normalizeTemplateId(templateParam));
    }
  }, [templateParam, setTemplateId]);

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
