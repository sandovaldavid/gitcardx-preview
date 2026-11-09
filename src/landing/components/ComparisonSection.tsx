'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Sparkles,
  XCircle,
  ArrowRight,
  ChevronsLeftRight,
  SlidersHorizontal,
} from 'lucide-react';
import { CardRenderer } from '@/cards/templates/CardTemplateRegistry';
import { KNOWN_REPO_FALLBACKS } from '@/core/services/GitHubService';
import type { CardConfig, RepoMetadata, TemplateId } from '@/core/domain/schemas';
import { DEFAULT_CONFIG, TEMPLATE_SIGNATURE_PATTERNS } from '@/studio/state/useCardStore';
import { PRESET_PALETTES } from '@/core/theme/ThemeEngine';
import { ScaledCard } from './ScaledCard';

interface CompareProject {
  id: string;
  label: string;
  owner: string;
  repoName: string;
  defaultTemplateId: TemplateId;
  paletteKey: keyof typeof PRESET_PALETTES;
  title: string;
  tagline: string;
  installCommand: string;
  repo: RepoMetadata;
}

const COMPARISON_PROJECTS: CompareProject[] = [
  {
    id: 'shadcn',
    label: 'shadcn-ui/ui',
    owner: 'shadcn-ui',
    repoName: 'ui',
    defaultTemplateId: 'oss-credibility',
    paletteKey: 'slate-minimal',
    title: 'shadcn/ui',
    tagline: 'Beautifully designed components that you can copy and paste into your apps.',
    installCommand: 'pnpm dlx shadcn@latest init',
    repo: KNOWN_REPO_FALLBACKS['shadcn-ui/ui'],
  },
  {
    id: 'tailwind',
    label: 'tailwindlabs/tailwindcss',
    owner: 'tailwindlabs',
    repoName: 'tailwindcss',
    defaultTemplateId: 'blueprint-grid',
    paletteKey: 'dark-oled',
    title: 'Tailwind CSS',
    tagline: 'A utility-first CSS framework for rapidly building modern websites.',
    installCommand: 'npm i tailwindcss @tailwindcss/vite',
    repo: KNOWN_REPO_FALLBACKS['tailwindlabs/tailwindcss'],
  },
  {
    id: 'uv',
    label: 'astral-sh/uv',
    owner: 'astral-sh',
    repoName: 'uv',
    defaultTemplateId: 'cli-terminal',
    paletteKey: 'dark-oled',
    title: 'astral-sh / uv',
    tagline: 'An extremely fast Python package and project manager, written in Rust.',
    installCommand: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
    repo: KNOWN_REPO_FALLBACKS['astral-sh/uv'],
  },
];

const SHOWCASE_TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'oss-credibility', label: 'OSS Credibility' },
  { id: 'sdk-package', label: 'SDK Package' },
  { id: 'blueprint-grid', label: 'Blueprint Grid' },
  { id: 'aurora-mesh', label: 'Aurora Mesh' },
  { id: 'cli-terminal', label: 'CLI Terminal' },
  { id: 'release-spotlight', label: 'Release Spotlight' },
];

function buildProjectConfig(project: CompareProject, templateId: TemplateId): CardConfig {
  const palette = PRESET_PALETTES[project.paletteKey] ?? DEFAULT_CONFIG.palette;
  const patternId = TEMPLATE_SIGNATURE_PATTERNS[templateId] ?? DEFAULT_CONFIG.backgroundPattern.id;

  return {
    ...DEFAULT_CONFIG,
    templateId,
    title: project.title,
    tagline: project.tagline,
    installCommand: project.installCommand,
    palette,
    backgroundPattern: {
      id: patternId,
      opacity: 0.35,
    },
    visibility: {
      stars: true,
      forks: true,
      release: true,
      license: true,
      contributors: true,
      techStack: true,
      languageLogos: true,
      author: true,
      tagline: true,
      installCommand: true,
      issues: false,
      discussions: false,
    },
  };
}

export const ComparisonSection: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string>('shadcn');
  const [selectedTemplateOverride, setSelectedTemplateOverride] = useState<TemplateId | null>(null);
  const [githubImageError, setGithubImageError] = useState<Record<string, boolean>>({});
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeProject =
    COMPARISON_PROJECTS.find((p) => p.id === activeProjectId) ?? COMPARISON_PROJECTS[0];

  const activeTemplateId = selectedTemplateOverride ?? activeProject.defaultTemplateId;
  const gitframeConfig = buildProjectConfig(activeProject, activeTemplateId);
  const githubOgUrl = `https://opengraph.githubassets.com/1/${activeProject.owner}/${activeProject.repoName}`;
  const isImageFailed = Boolean(githubImageError[activeProject.id]);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setSelectedTemplateOverride(null);
  };

  const updateSliderFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPos(Math.round(percent * 10) / 10);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPos(100);
    }
  };

  return (
    <section id="comparison" className="relative border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="reveal mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real Project Comparison</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Default GitHub Preview vs. Gitframe
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Slide the central bar horizontally to reveal the direct difference between GitHub&apos;s
            default generated social card and our tailored Gitframe preview on real production
            repositories.
          </p>

          {/* Project & Template Switchers */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="mr-1 text-xs font-medium text-zinc-500">Compare real repo:</span>
              {COMPARISON_PROJECTS.map((project) => {
                const isActive = project.id === activeProjectId;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => handleSelectProject(project.id)}
                    aria-pressed={isActive}
                    className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none ${
                      isActive
                        ? 'border border-blue-500/40 bg-blue-600/20 text-blue-300 shadow-sm'
                        : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {project.label}
                  </button>
                );
              })}
            </div>

            {/* Template Variant Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="mr-1 text-[11px] font-medium text-zinc-500">Template style:</span>
              {SHOWCASE_TEMPLATES.map((tpl) => {
                const isSelected = activeTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateOverride(tpl.id)}
                    aria-pressed={isSelected}
                    className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-all duration-150 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:outline-none ${
                      isSelected
                        ? 'border border-blue-500/50 bg-blue-500/20 font-semibold text-blue-300 shadow-xs'
                        : 'border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {tpl.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Single-Card Split Slider */}
        <div className="reveal mx-auto max-w-5xl">
          <div
            ref={containerRef}
            role="slider"
            tabIndex={0}
            aria-label="Comparison slider between Default GitHub Preview and Gitframe Social Preview"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={sliderPos}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            className="group relative aspect-2/1 w-full select-none overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950 shadow-2xl shadow-blue-500/5 ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none touch-none"
            style={{ cursor: isDragging ? 'grabbing' : 'ew-resize' }}
          >
            {/* Layer 1 (Bottom/Right): Gitframe Social Preview Card */}
            <div className="absolute inset-0 h-full w-full">
              <ScaledCard>
                <div key={`${activeProject.id}-${activeTemplateId}`} className="card-enter">
                  <CardRenderer repo={activeProject.repo} config={gitframeConfig} />
                </div>
              </ScaledCard>
            </div>

            {/* Layer 2 (Top/Left): Default GitHub Social Preview Card (Clipped by Slider) */}
            <div
              className="absolute inset-0 h-full w-full overflow-hidden bg-[#0d1117]"
              style={{
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
              }}
            >
              {!isImageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={activeProject.id}
                  src={githubOgUrl}
                  alt={`Default GitHub Social Preview for ${activeProject.owner}/${activeProject.repoName}`}
                  className="pointer-events-none h-full w-full object-cover"
                  onError={() => {
                    setGithubImageError((prev) => ({ ...prev, [activeProject.id]: true }));
                  }}
                />
              ) : (
                /* Authentic GitHub Fallback layout if external asset is inaccessible */
                <div className="flex h-full w-full flex-col justify-between p-8 sm:p-14">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-base text-zinc-500 sm:text-lg">
                        {activeProject.owner} /
                      </span>
                      <h3 className="mt-1 font-mono text-3xl font-bold text-zinc-100 sm:text-4xl">
                        {activeProject.repoName}
                      </h3>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeProject.repo.owner.avatarUrl}
                      alt={activeProject.owner}
                      className="h-16 w-16 rounded-full border border-zinc-700"
                    />
                  </div>
                  <p className="line-clamp-2 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                    {activeProject.repo.description}
                  </p>
                  <div className="flex items-center gap-6 border-t border-zinc-800 pt-4 font-mono text-sm text-zinc-500 sm:text-base">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{
                          backgroundColor: activeProject.repo.primaryLanguage?.color || '#3178C6',
                        }}
                      />
                      <span>{activeProject.repo.primaryLanguage?.name || 'Code'}</span>
                    </div>
                    <div>★ {activeProject.repo.stars.toLocaleString()}</div>
                    <div>⑂ {activeProject.repo.forks.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Side Indicators */}
            <div className="pointer-events-none absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/85 px-3 py-1.5 text-xs font-semibold text-rose-300 shadow-md backdrop-blur-md">
              <XCircle className="h-3.5 w-3.5 text-rose-400" />
              <span>Default GitHub Social Preview</span>
              <span className="hidden font-mono text-[10px] text-zinc-500 sm:inline-block">
                1200×600
              </span>
            </div>

            <div className="pointer-events-none absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-blue-500/40 bg-zinc-950/85 px-3 py-1.5 text-xs font-semibold text-blue-300 shadow-md shadow-blue-500/10 backdrop-blur-md">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Gitframe Social Preview</span>
              <span className="hidden font-mono text-[10px] text-blue-400/80 sm:inline-block">
                Retina 2x & SVG
              </span>
            </div>

            {/* Draggable Vertical Divider Bar & Handle */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-zinc-900/90 text-white shadow-2xl backdrop-blur-md transition-transform duration-150 group-hover:scale-110">
                <ChevronsLeftRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons & Interaction Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-medium text-zinc-300">Drag central bar to compare</span>
              <span className="hidden text-zinc-600 sm:inline">|</span>
              <span className="hidden text-zinc-500 sm:inline">
                Position: {Math.round(sliderPos)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-500">Quick views:</span>
              <button
                type="button"
                onClick={() => setSliderPos(100)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  sliderPos >= 98
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                100% GitHub
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(50)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  sliderPos >= 45 && sliderPos <= 55
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                50/50 Split
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(0)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  sliderPos <= 2
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                100% Gitframe
              </button>
            </div>
          </div>

          {/* Side-by-side Technical Highlights */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Default GitHub Drawbacks */}
            <div className="rounded-xl border border-rose-950/40 bg-zinc-900/30 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-rose-400">
                <XCircle className="h-4 w-4" />
                <span>Default GitHub Social Preview Limitations</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500/70">•</span>
                  <span>
                    Rigid cookie-cutter layout with tiny text metrics and generic GitHub styling.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500/70">•</span>
                  <span>
                    No official tech stack logos, framework badges, or ecosystem identity.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500/70">•</span>
                  <span>
                    No package manager install snippet to drive direct developer onboarding.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500/70">•</span>
                  <span>Fixed 1200×600 raster with no Retina 2x rendering or vector SVG.</span>
                </li>
              </ul>
            </div>

            {/* Gitframe Advantages */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-blue-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Gitframe Social Preview Advantages</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    High-impact OSS credibility: giant hero metric badges, compact numbers (
                    {activeProject.repo.stars.toLocaleString()} stars), and contributors.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    Collision-free multi-language vector bar and automated official stack logos.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Prominent install command snippet and active release milestone badge.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>
                    Retina 2560×1280 PNG export, vector SVG, and dynamic zero-config README
                    endpoint.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Studio Link for active project */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-mono text-xs text-zinc-300">
                Active preview: <span className="text-blue-400">{activeProject.label}</span> with{' '}
                <span className="text-zinc-100">{activeTemplateId}</span> template
              </span>
            </div>

            <Link
              href={`/studio?repo=${activeProject.owner}/${activeProject.repoName}&template=${activeTemplateId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-blue-500"
            >
              <span>Customize {activeProject.repoName} in Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
