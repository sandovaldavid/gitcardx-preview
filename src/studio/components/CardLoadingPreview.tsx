'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export interface CardLoadingPreviewProps {
  repoName?: string | null;
  scale?: number;
  className?: string;
}

export const CardLoadingPreview: React.FC<CardLoadingPreviewProps> = ({
  repoName,
  scale = 1,
  className = '',
}) => {
  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: 1280 * scale,
        height: 640 * scale,
      }}
      data-testid="card-loading-preview"
    >
      {/* 1280x640 Canvas Card Container */}
      <div
        style={{
          width: 1280,
          height: 640,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          borderRadius: 16,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
        className="relative overflow-hidden bg-[#090d16] flex flex-col justify-between p-14 border border-zinc-800/80"
      >
        {/* Architectural grid backdrop */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Central luminous radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle 500px at 50% 50%, rgba(59, 130, 246, 0.12), transparent 70%)',
          }}
        />

        {/* Sweeping shimmer beam across the entire card */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="h-full w-full -translate-x-full bg-linear-to-r from-transparent via-white/[0.04] to-transparent shimmer-sweep" />
        </div>

        {/* SKELETON: Top Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar skeleton */}
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 animate-pulse flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-zinc-600 animate-pulse" />
            </div>

            {/* Owner badge placeholder */}
            <div className="flex flex-col gap-2">
              <div className="h-6 w-36 rounded-md bg-zinc-800/70 animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-zinc-800/50 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-32 rounded-full bg-zinc-800/70 border border-zinc-700/50 animate-pulse" />
          </div>
        </div>

        {/* SKELETON: Center Hero Area */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-5 my-auto text-center">
          {repoName ? (
            <div className="flex flex-col items-center gap-3.5">
              <h2 className="text-5xl font-mono font-bold tracking-tight text-zinc-100 animate-pulse">
                {repoName}
              </h2>
              <div className="h-6 w-[640px] max-w-full rounded-lg bg-zinc-800/60 animate-pulse" />
              <div className="h-6 w-[420px] max-w-full rounded-lg bg-zinc-800/40 animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3.5">
              <div className="h-14 w-[520px] max-w-full rounded-2xl bg-zinc-800/70 animate-pulse" />
              <div className="h-6 w-[640px] max-w-full rounded-lg bg-zinc-800/60 animate-pulse" />
              <div className="h-6 w-[420px] max-w-full rounded-lg bg-zinc-800/40 animate-pulse" />
            </div>
          )}
        </div>

        {/* SKELETON: Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Tech stack badges */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-24 rounded-lg bg-zinc-800/70 border border-zinc-700/50 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-zinc-800/70 border border-zinc-700/50 animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-zinc-800/70 border border-zinc-700/50 animate-pulse" />
          </div>

          {/* Metric pills */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 rounded-full bg-zinc-800/70 border border-zinc-700/50 animate-pulse" />
            <div className="h-9 w-20 rounded-full bg-zinc-800/70 border border-zinc-700/50 animate-pulse" />
            <div className="h-9 w-24 rounded-full bg-zinc-800/70 border border-zinc-700/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
