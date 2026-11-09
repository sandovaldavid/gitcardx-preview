'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles, XCircle, ArrowRight } from 'lucide-react';
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
    },
  };
}

export const ComparisonSection: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string>('shadcn');
  const [selectedTemplateOverride, setSelectedTemplateOverride] = useState<TemplateId | null>(null);
  const [githubImageError, setGithubImageError] = useState<Record<string, boolean>>({});

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

  return (
    <section id="comparison" className="relative border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="reveal mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real Project Comparison</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Default GitHub Preview vs. Gitframe
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            When shared on X, LinkedIn, Discord, or Slack, GitHub automatically serves its default
            generated card. See the real difference on actual production repositories.
          </p>

          {/* Real Project Switcher */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
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
        </div>

        {/* Side by side comparison cards */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {/* Default GitHub Card (Before) */}
          <div className="reveal flex flex-col justify-between overflow-hidden rounded-2xl border border-rose-950/60 bg-linear-to-b from-zinc-900/40 to-zinc-950/60 p-6 md:p-8">
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                  <XCircle className="h-4 w-4" />
                  <span>Default GitHub Social Preview</span>
                </div>
                <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                  Auto-generated · 1200×600
                </span>
              </div>

              {/* GitHub Default Card Presentation */}
              <div className="relative aspect-2/1 w-full overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117] shadow-lg">
                {!isImageFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={activeProject.id}
                    src={githubOgUrl}
                    alt={`Default GitHub Social Preview for ${activeProject.owner}/${activeProject.repoName}`}
                    className="h-full w-full object-cover transition-opacity duration-300"
                    onError={() => {
                      setGithubImageError((prev) => ({ ...prev, [activeProject.id]: true }));
                    }}
                  />
                ) : (
                  /* Authentic fallback representation if GitHub CDN is offline */
                  <div className="flex h-full w-full flex-col justify-between p-6 sm:p-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-zinc-500">
                          {activeProject.owner} /
                        </span>
                        <h3 className="mt-1 font-mono text-xl font-bold text-zinc-200">
                          {activeProject.repoName}
                        </h3>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeProject.repo.owner.avatarUrl}
                        alt={activeProject.owner}
                        className="h-10 w-10 rounded-full border border-zinc-700"
                      />
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
                      {activeProject.repo.description}
                    </p>
                    <div className="flex items-center gap-4 border-t border-zinc-800 pt-3 font-mono text-[11px] text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
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
            </div>

            {/* GitHub Default Drawbacks */}
            <ul className="mt-8 space-y-3 text-xs text-zinc-400">
              <li className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/80" />
                <span>
                  Rigid, cookie-cutter layout with small text metrics and generic GitHub styling.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/80" />
                <span>
                  No ecosystem stack badges or vector framework logos (e.g. Next.js, Tailwind,
                  React, Radix).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/80" />
                <span>
                  No package manager install snippet to drive direct developer onboarding.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/80" />
                <span>Fixed 1200×600 raster with no Retina 2x rendering or vector SVG export.</span>
              </li>
            </ul>
          </div>

          {/* Gitframe Preview (After) */}
          <div className="reveal flex flex-col justify-between overflow-hidden rounded-2xl border border-blue-500/40 bg-linear-to-b from-blue-950/20 via-zinc-900/60 to-zinc-950/80 p-6 shadow-2xl shadow-blue-500/5 md:p-8">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Gitframe Social Preview</span>
                </div>
                <span className="rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 font-mono text-[11px] font-medium text-blue-300">
                  1280×640 · Retina 2x & SVG
                </span>
              </div>

              {/* Archetype Selector */}
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-medium text-zinc-400">Template:</span>
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
                          : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  );
                })}
              </div>

              {/* Real Gitframe Card Renderer */}
              <div className="relative aspect-2/1 w-full overflow-hidden rounded-xl border border-blue-500/30 bg-zinc-950 shadow-2xl">
                <ScaledCard>
                  <div key={`${activeProject.id}-${activeTemplateId}`} className="card-enter">
                    <CardRenderer repo={activeProject.repo} config={gitframeConfig} />
                  </div>
                </ScaledCard>
              </div>
            </div>

            {/* Gitframe Advantages */}
            <ul className="mt-8 space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  High-impact OSS credibility: Giant hero metric badges highlighting{' '}
                  {activeProject.repo.stars.toLocaleString()}+ stars,{' '}
                  {activeProject.repo.forks.toLocaleString()}+ forks, and active maintainers.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  Multi-language vector distribution bar and automated official tech stack logos.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  Prominent install command snippet and active release milestone badge (
                  {activeProject.repo.latestRelease?.tag || 'v2.0.0'}).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>
                  Full Retina 2560×1280 PNG export, vector SVG, and dynamic zero-config README
                  endpoint.
                </span>
              </li>
            </ul>

            {/* Studio Link for this real project */}
            <div className="mt-8 flex items-center justify-between border-t border-zinc-800/80 pt-4">
              <span className="font-mono text-[11px] text-zinc-500">
                Active: {activeTemplateId}
              </span>
              <Link
                href={`/studio?repo=${activeProject.owner}/${activeProject.repoName}&template=${activeTemplateId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition-colors duration-200 hover:text-blue-300"
              >
                <span>Customize {activeProject.repoName} in Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
