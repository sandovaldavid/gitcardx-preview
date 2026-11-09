'use client';

import React from 'react';
import Link from 'next/link';
import { GitframeLogo } from '@/components/GitframeLogo';
import { CardLoadingPreview } from './CardLoadingPreview';
import { Loader2 } from 'lucide-react';

interface StudioLoadingViewProps {
  repoName?: string;
}

export const StudioLoadingView: React.FC<StudioLoadingViewProps> = ({ repoName }) => {
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 select-none"
      data-testid="studio-loading-view"
    >
      {/* Top Header Placeholder */}
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <GitframeLogo className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-sm tracking-tight text-zinc-100">
              Git<span className="text-blue-500">frame</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Studio
          </span>
        </div>

        {/* Center Mock Omnibar */}
        <div className="flex-1 max-w-xl mx-auto px-4 hidden md:block">
          <div className="relative flex items-center h-9 px-3.5 rounded-xl border border-blue-500/40 bg-zinc-900/80 text-sm text-zinc-300 shadow-inner">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2.5 shrink-0" />
            <span className="font-mono text-xs text-blue-300 truncate">
              {repoName ? `${repoName}` : 'Connecting to GitHub GraphQL API...'}
            </span>
          </div>
        </div>

        {/* Right actions placeholder */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-blue-600/30 border border-blue-500/30 animate-pulse" />
        </div>
      </header>

      {/* Main Workspace with Panels & Centered Card Preview */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Inspector placeholder */}
        <aside className="w-72 lg:w-80 border-r border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md hidden md:flex flex-col p-4 gap-4 shrink-0">
          <div className="h-4 w-32 rounded bg-zinc-800/70 animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
          <div className="h-24 w-full rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
          <div className="h-32 w-full rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
        </aside>

        {/* Center Canvas Area with CardLoadingPreview */}
        <main className="flex-1 overflow-hidden relative flex items-center justify-center p-6 bg-zinc-950">
          <CardLoadingPreview repoName={repoName} scale={0.62} />
        </main>

        {/* Right Inspector placeholder */}
        <aside className="w-80 lg:w-92 border-l border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md hidden lg:flex flex-col p-4 gap-4 shrink-0">
          <div className="h-4 w-36 rounded bg-zinc-800/70 animate-pulse" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-20 rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
            <div className="h-20 rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
            <div className="h-20 rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
            <div className="h-20 rounded-xl bg-zinc-900/80 border border-zinc-800/60 animate-pulse" />
          </div>
        </aside>
      </div>
    </div>
  );
};
