'use client';

import React, { useEffect } from 'react';
import { StudioHeader } from './StudioHeader';
import { LeftInspector } from './LeftInspector';
import { InteractiveCanvas } from './InteractiveCanvas';
import { RightInspector } from './RightInspector';
import { ExportModal } from './ExportModal';
import { useCardStore } from '../state/useCardStore';
import type { RepoMetadata } from '@/core/domain/schemas';

interface StudioLayoutProps {
  initialRepo?: RepoMetadata;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({ initialRepo }) => {
  const { setRepo } = useCardStore();

  useEffect(() => {
    if (initialRepo) {
      setRepo(initialRepo, true);
    }
  }, [initialRepo, setRepo]);

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
