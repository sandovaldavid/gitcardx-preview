'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Database, GitBranch, Palette } from 'lucide-react';

export interface CardLoadingPreviewProps {
  repoName?: string | null;
  scale?: number;
  showHud?: boolean;
  className?: string;
}

const EXTRACTION_STEPS = [
  {
    icon: Database,
    title: 'Connecting to GitHub API v4',
    detail: 'Querying repository metadata and commit history',
  },
  {
    icon: GitBranch,
    title: 'Extracting stats & tech stack',
    detail: 'Stars, forks, contributors, languages & releases',
  },
  {
    icon: Palette,
    title: 'Synthesizing card preview',
    detail: 'Applying theme, high-contrast palette & typography',
  },
];

export const CardLoadingPreview: React.FC<CardLoadingPreviewProps> = ({
  repoName,
  scale = 1,
  showHud = true,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Cycle through extraction steps every 800ms to simulate progressive pipeline execution
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < EXTRACTION_STEPS.length - 1 ? prev + 1 : prev));
    }, 850);
    return () => clearInterval(timer);
  }, []);

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
        className="relative overflow-hidden bg-[#090d16] flex flex-col justify-between p-14 border border-zinc-800"
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

            {/* Owner & Type badges */}
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
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 my-auto text-center">
          {repoName ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-mono font-bold tracking-tight text-blue-400/90 animate-pulse">
                {repoName}
              </span>
              <div className="h-6 w-96 max-w-full rounded-lg bg-zinc-800/60 animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-110 rounded-2xl bg-zinc-800/70 animate-pulse" />
              <div className="h-6 w-80 rounded-lg bg-zinc-800/50 animate-pulse" />
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

        {/* Central Floating Glassmorphic Extraction HUD */}
        {showHud && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-[2px]">
            <div className="relative w-full max-w-md rounded-2xl border border-blue-500/30 bg-zinc-950/90 backdrop-blur-xl p-6 shadow-2xl shadow-blue-950/50 flex flex-col items-center text-center gap-4.5">
              {/* Outer soft glow ring */}
              <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-linear-to-r from-blue-600/20 via-indigo-500/20 to-cyan-500/20 blur-xl opacity-75 -z-10" />

              {/* Glowing header badge */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-400 shadow-md shadow-blue-500/20">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Extracting Repository
                </span>
                <h3 className="text-base font-bold text-zinc-100">
                  {repoName ? (
                    <span className="font-mono text-zinc-100">{repoName}</span>
                  ) : (
                    'Generating Social Preview Card'
                  )}
                </h3>
              </div>

              {/* Progressive Extraction Steps */}
              <div className="w-full flex flex-col gap-2 text-left bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
                {EXTRACTION_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <div
                      key={step.title}
                      className={`flex items-center gap-3 transition-opacity duration-300 ${
                        isCurrent ? 'opacity-100' : isDone ? 'opacity-70' : 'opacity-40'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs transition-colors ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isCurrent
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse'
                              : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isDone ? '✓' : <Icon className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-medium truncate ${
                            isCurrent ? 'text-zinc-200' : 'text-zinc-400'
                          }`}
                        >
                          {step.title}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Smooth gradient progress bar */}
              <div className="w-full flex flex-col gap-1.5">
                <div className="w-full h-1.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500 via-indigo-400 to-cyan-400 rounded-full shimmer-sweep" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>GitHub GraphQL v4</span>
                  <span>Synthesizing card</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
