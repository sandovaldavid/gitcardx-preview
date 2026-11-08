'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CornerDownLeft, Eye, ShieldCheck, Zap } from 'lucide-react';
import { parseGitHubInput } from '@/core/domain/parser';
import { CardRenderer } from '@/cards/templates/CardTemplateRegistry';
import { DEFAULT_REPO, DEFAULT_CONFIG } from '@/studio/state/useCardStore';
import type { CardConfig, TemplateId } from '@/core/domain/schemas';

const PRESET_REPOS = [
  { label: 'shadcn/ui', value: 'shadcn/ui' },
  { label: 'facebook/react', value: 'facebook/react' },
  { label: 'astral-sh/uv', value: 'astral-sh/uv' },
  { label: 'torvalds/linux', value: 'torvalds/linux' },
];

export const HeroGenerator: React.FC = () => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('linear-minimal');

  const handleGenerate = (target?: string) => {
    const raw = target || inputValue;
    if (!raw.trim()) {
      setError('Please enter a GitHub repository (e.g. vercel/next.js)');
      return;
    }

    const parsed = parseGitHubInput(raw.trim());
    if (parsed.type === 'invalid') {
      setError(parsed.error);
      return;
    }
    if (parsed.type === 'owner') {
      setError('Please provide both owner and repository name (e.g. facebook/react)');
      return;
    }

    setError(null);
    router.push(`/${parsed.owner}/${parsed.repo}`);
  };

  const previewConfig: CardConfig = {
    ...DEFAULT_CONFIG,
    templateId: activeTemplate,
    backgroundPattern: {
      id: activeTemplate === 'aurora-mesh' ? 'aurora-mesh' : 'architectural-grid',
      opacity: 0.5,
    },
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-linear-to-tr from-blue-600/15 via-indigo-500/15 to-violet-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">100% Free · Zero Sign-Up · Satori + Resvg Powered</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
          Give your GitHub projects{' '}
          <span className="bg-linear-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            the visual identity
          </span>{' '}
          they deserve.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Default GitHub social previews are generic, dull grey, and easy to scroll past. Generate
          pixel-perfect, high-contrast <span className="text-zinc-200 font-medium">1280×640px</span>{' '}
          preview cards in 5 seconds.
        </p>

        {/* Omnibar Input Box */}
        <div className="w-full max-w-2xl mt-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="relative flex items-center bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-2 shadow-2xl shadow-blue-500/5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
          >
            <div className="pl-3 pr-2 text-zinc-500 select-none font-mono text-sm">github.com/</div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder="owner/repository or paste URL..."
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none py-2"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0 ml-2"
            >
              <span>Generate</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Validation Error */}
          {error && (
            <p className="text-red-400 text-xs mt-2 text-left pl-3 animate-in fade-in">{error}</p>
          )}

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-zinc-400">
            <span className="text-zinc-500 font-medium">Try popular repos:</span>
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setInputValue(preset.value);
                  handleGenerate(preset.value);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-colors font-mono text-[11px]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Interactive Card Preview Container */}
        <div className="w-full max-w-4xl mt-14 flex flex-col items-center">
          {/* Template Switcher Tabs */}
          <div className="flex items-center gap-2 mb-4 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl">
            {(
              [
                { id: 'linear-minimal', label: 'Linear Minimal' },
                { id: 'cli-terminal', label: 'CLI Terminal' },
                { id: 'aurora-mesh', label: 'Aurora Mesh' },
                { id: 'blueprint-grid', label: 'Blueprint Grid' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTemplate(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTemplate === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Card Frame with Scale */}
          <div className="w-full relative rounded-2xl p-2 bg-linear-to-b from-zinc-800/60 to-zinc-900/40 border border-zinc-800/80 shadow-2xl backdrop-blur-sm group">
            <div className="relative aspect-2/1 w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/60 shadow-inner flex items-center justify-center">
              {/* Scaled Real Satori Card */}
              <div
                className="absolute top-0 left-0 origin-top-left pointer-events-none"
                style={{
                  width: 1280,
                  height: 640,
                  transform: 'scale(var(--hero-scale, 0.65))',
                }}
                ref={(el) => {
                  if (el && el.parentElement) {
                    const parentW = el.parentElement.clientWidth;
                    const scale = parentW / 1280;
                    el.style.transform = `scale(${scale})`;
                  }
                }}
              >
                <CardRenderer repo={DEFAULT_REPO} config={previewConfig} />
              </div>

              {/* Hover Overlay with CTA */}
              <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-4">
                <Link
                  href="/studio"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xl transition-transform hover:scale-105"
                >
                  <Eye className="w-4 h-4" />
                  <span>Customize in Studio</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Micro badges below preview */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sub-second Serverless Rendering</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Cookies or Mandatory Tracking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Retina 2560×1280 & Vector SVG</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
