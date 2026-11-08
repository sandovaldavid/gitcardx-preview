'use client';

import React from 'react';
import { XCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section id="comparison" className="py-20 md:py-28 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The 5-Second Difference</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Default GitHub Card vs. GitCardX
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Social platforms crop and compress previews. A generic card makes your repo look like an
            abandoned project. A GitCardX preview builds instant credibility.
          </p>
        </div>

        {/* Side by side comparison cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Default GitHub Card (Before) */}
          <div className="flex flex-col rounded-2xl border border-red-950/60 bg-linear-to-b from-zinc-900/40 to-zinc-950/60 p-6 md:p-8 relative overflow-hidden group">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                <XCircle className="w-4 h-4" />
                <span>Default GitHub Social Preview</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-zinc-800/60">
                Auto-generated
              </span>
            </div>

            {/* Mock of Default GitHub Preview */}
            <div className="w-full aspect-2/1 rounded-xl bg-[#0d1117] border border-[#30363d] p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-zinc-500 font-mono text-xs">sandovaldavid /</div>
                  <div className="text-zinc-200 font-semibold text-xl mt-1">gitcardx-preview</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-zinc-400 font-bold text-xs">
                  GP
                </div>
              </div>

              <div className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                Instant GitHub Social Preview & Open Graph card generator with 8 Satori archetypes,
                generative SVG backgrounds...
              </div>

              <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono border-t border-[#21262d] pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6]" />
                  <span>TypeScript</span>
                </div>
                <div>★ 1.2k</div>
                <div>⑂ 185</div>
              </div>
            </div>

            {/* Critiques */}
            <ul className="mt-8 space-y-3 text-xs text-zinc-400">
              <li className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-red-400/80 shrink-0" />
                <span>Monotonous grey styling blends in with dark feeds, zero contrast</span>
              </li>
              <li className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-red-400/80 shrink-0" />
                <span>No ecosystem stack pills (Next.js, Tailwind, Bun, Vitest)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-red-400/80 shrink-0" />
                <span>No install command, package snippet, or release milestone</span>
              </li>
              <li className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-red-400/80 shrink-0" />
                <span>Blurs on high-density Retina screens (@1x 640px)</span>
              </li>
            </ul>
          </div>

          {/* GitCardX Preview (After) */}
          <div className="flex flex-col rounded-2xl border border-blue-600/40 bg-linear-to-b from-blue-950/20 via-zinc-900/60 to-zinc-950/80 p-6 md:p-8 relative overflow-hidden group shadow-2xl shadow-blue-500/10">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>GitCardX Social Preview</span>
              </div>
              <span className="text-[11px] font-mono text-blue-300 font-medium px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">
                1280×640 Retina & SVG
              </span>
            </div>

            {/* Mock of GitCardX Preview */}
            <div className="w-full aspect-2/1 rounded-xl bg-zinc-950 border border-blue-500/30 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              {/* Subtle background grid pattern */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                }}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 text-sm">
                    GX
                  </div>
                  <div>
                    <span className="text-xs text-blue-400 font-mono">sandovaldavid /</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      gitcardx-preview
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                  v1.0.0
                </span>
              </div>

              <p className="text-zinc-300 text-xs font-normal relative z-10 line-clamp-2">
                Instant GitHub Social Preview & Open Graph card generator with 8 Satori archetypes,
                generative SVG backgrounds, and dynamic README API.
              </p>

              <div className="flex items-center justify-between relative z-10 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono">
                    TypeScript
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono">
                    Next.js
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono">
                    Tailwind
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span className="text-amber-400 font-semibold">★ 1,240</span>
                  <span>⑂ 185</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <ul className="mt-8 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Vibrant contrast and generative backgrounds that stop the scroll</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Automatic tech stack mapper (40+ ecosystems and icons)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Retina 2560×1280 export & dynamic SVG README banners</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Live multi-platform social simulator (X, LinkedIn, Discord, Slack)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
