'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StudioHeader } from './StudioHeader';
import { LeftInspector } from './LeftInspector';
import { InteractiveCanvas } from './InteractiveCanvas';
import { RightInspector } from './RightInspector';
import { ExportModal } from './ExportModal';
import { useCardStore } from '../state/useCardStore';
import type { RepoMetadata, TemplateId } from '@/core/domain/schemas';
import { CARD_TEMPLATES } from '@/cards/templates/CardTemplateRegistry';

interface StudioLayoutProps {
  initialRepo?: RepoMetadata;
}

const StudioInner: React.FC<StudioLayoutProps> = ({ initialRepo }) => {
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template') as TemplateId | null;
  const { setRepo, setTemplateId } = useCardStore();

  useEffect(() => {
    if (initialRepo) {
      setRepo(initialRepo, true);
    }
  }, [initialRepo, setRepo]);

  useEffect(() => {
    if (templateParam && CARD_TEMPLATES[templateParam]) {
      setTemplateId(templateParam);
    }
  }, [templateParam, setTemplateId]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <StudioHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftInspector />
        <InteractiveCanvas />
        <RightInspector />
      </div>
      <ExportModal />
    </div>
  );
};

export const StudioLayout: React.FC<StudioLayoutProps> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 animate-pulse" />
      }
    >
      <StudioInner {...props} />
    </Suspense>
  );
};
