'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CornerDownLeft, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { parseGitHubInput } from '@/core/domain/parser';
import { CardRenderer } from '@/cards/templates/CardTemplateRegistry';
import {
  DEFAULT_CONFIG,
  DEFAULT_REPO,
  TEMPLATE_SIGNATURE_PATTERNS,
} from '@/studio/state/useCardStore';
import type { CardConfig, TemplateId } from '@/core/domain/schemas';
import { ScaledCard } from './ScaledCard';
import { SectionLink } from './SectionLink';

const PRESET_REPOS = [
  { label: 'shadcn/ui', value: 'shadcn/ui' },
  { label: 'facebook/react', value: 'facebook/react' },
  { label: 'astral-sh/uv', value: 'astral-sh/uv' },
  { label: 'torvalds/linux', value: 'torvalds/linux' },
];

const FEATURED_TEMPLATES: Array<{ id: TemplateId; label: string }> = [
  { id: 'linear-minimal', label: 'Linear Minimal' },
  { id: 'cli-terminal', label: 'CLI Terminal' },
  { id: 'aurora-mesh', label: 'Aurora Mesh' },
  { id: 'blueprint-grid', label: 'Blueprint Grid' },
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
      ...DEFAULT_CONFIG.backgroundPattern,
      id: TEMPLATE_SIGNATURE_PATTERNS[activeTemplate] ?? DEFAULT_CONFIG.backgroundPattern.id,
    },
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-87.5 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-blue-600/15 via-indigo-500/15 to-violet-500/10 blur-[120px]" />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-300 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-medium">
            Free · Zero sign-up · Powered by{' '}
            <a
              href="https://github.com/vercel/satori"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
            >
              Satori
            </a>{' '}
            +{' '}
            <a
              href="https://github.com/thx/resvg-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-white hover:decoration-white"
            >
              Resvg
            </a>
          </span>
        </div>

        <h1 className="max-w-4xl text-4xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Give your GitHub projects{' '}
          <span className="bg-linear-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            the visual identity
          </span>{' '}
          they deserve.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Default GitHub social previews are generic, dull grey, and easy to scroll past. Generate
          pixel-perfect, high-contrast <span className="font-medium text-zinc-200">1280×640px</span>{' '}
          preview cards in 5 seconds.
        </p>

        <div className="mt-8 w-full max-w-2xl">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleGenerate();
            }}
            className="relative flex items-center rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-2 shadow-2xl shadow-blue-500/5 transition-[border-color,box-shadow] duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
          >
            <div className="hidden pr-2 pl-3 font-mono text-sm text-zinc-500 select-none sm:block">
              github.com/
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                if (error) setError(null);
              }}
              placeholder="owner/repository or paste URL..."
              aria-label="GitHub repository"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              className="ml-2 flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-500 active:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:outline-none sm:px-5"
            >
              <span>Generate</span>
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-2 pl-3 text-left text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-500">Try popular repos:</span>
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setInputValue(preset.value);
                  handleGenerate(preset.value);
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[11px] text-zinc-300 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 flex w-full max-w-4xl flex-col items-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
            {FEATURED_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setActiveTemplate(template.id)}
                aria-pressed={activeTemplate === template.id}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none ${
                  activeTemplate === template.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {template.label}
              </button>
            ))}
            <SectionLink
              sectionId="templates"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-zinc-200"
            >
              All 8
              <ArrowRight className="h-3 w-3" />
            </SectionLink>
          </div>

          <div className="group relative w-full rounded-2xl border border-zinc-800/80 bg-linear-to-b from-zinc-800/60 to-zinc-900/40 p-2 shadow-2xl backdrop-blur-sm transition-colors duration-300 hover:border-zinc-700">
            <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950 shadow-inner">
              <ScaledCard>
                <div key={activeTemplate} className="card-enter">
                  <CardRenderer repo={DEFAULT_REPO} config={previewConfig} />
                </div>
              </ScaledCard>
            </div>

            <div className="flex flex-col gap-3 px-2 pt-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live card preview · {FEATURED_TEMPLATES.find((t) => t.id === activeTemplate)?.label}
              </div>
              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition-colors duration-200 hover:bg-zinc-700 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none"
              >
                Customize in Studio
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Sub-second serverless rendering</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>No cookies or mandatory tracking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Retina 2560×1280 & vector SVG</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
