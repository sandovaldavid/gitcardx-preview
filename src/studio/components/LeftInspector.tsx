'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Eye,
  Terminal,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlignLeft,
  AlignCenter,
  Layout,
} from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import type { CardVisibility } from '@/core/domain/schemas';

export const LeftInspector: React.FC = () => {
  const { config, updateConfig, setContentAlign, toggleVisibility, repo, setRepo } = useCardStore();
  const [isManualModeOpen, setIsManualModeOpen] = useState(false);

  const visibilityKeys: Array<{ key: keyof CardVisibility; label: string }> = [
    { key: 'author', label: 'Owner / Avatar' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'stars', label: 'GitHub Stars' },
    { key: 'forks', label: 'Forks' },
    { key: 'release', label: 'Latest Release' },
    { key: 'license', label: 'License' },
    { key: 'techStack', label: 'Tech Stack Badges' },
    { key: 'languageLogos', label: 'Official Logos' },
    { key: 'installCommand', label: 'Install Command' },
    { key: 'contributors', label: 'Contributors' },
  ];

  return (
    <aside className="w-80 lg:w-88 border-r border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto z-20 shrink-0">
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Card Content & Metrics
          </h2>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Content Alignment */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-blue-400" />
              Content Alignment
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              {config.contentAlign}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setContentAlign('left')}
              className={`h-8 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                config.contentAlign === 'left'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-blue-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Left</span>
            </button>
            <button
              type="button"
              onClick={() => setContentAlign('center')}
              className={`h-8 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                config.contentAlign === 'center'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-blue-300 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
              <span>Center</span>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
            <span>Card Title</span>
            <span className="text-[10px] font-mono text-zinc-600">{config.title.length}/100</span>
          </label>
          <input
            type="text"
            value={config.title}
            maxLength={100}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="e.g. Next.js"
            className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <span className="text-blue-400 font-mono">*keyword*</span>
            <span>wraps with accent color</span>
          </span>
        </div>

        {/* Tagline Textarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
            <span>Tagline / Description</span>
            <span className="text-[10px] font-mono text-zinc-600">{config.tagline.length}/300</span>
          </label>
          <textarea
            value={config.tagline}
            maxLength={300}
            rows={3}
            onChange={(e) => updateConfig({ tagline: e.target.value })}
            placeholder="Short, impactful description of your project..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
          />
        </div>

        {/* Install Command Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Install Command / Snippet</span>
          </label>
          <input
            type="text"
            value={config.installCommand || ''}
            onChange={(e) => updateConfig({ installCommand: e.target.value })}
            placeholder="e.g. bun add my-package"
            className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Custom Logo URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Custom Logo URL (optional)</span>
          </label>
          <input
            type="url"
            value={config.customLogoUrl || ''}
            onChange={(e) => updateConfig({ customLogoUrl: e.target.value })}
            placeholder="https://... or data:image/png;base64,..."
            className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        {/* Metrics Visibility Toggles */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
          <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span>Visible Elements</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {visibilityKeys.map(({ key, label }) => {
              const active = config.visibility[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleVisibility(key)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left flex items-center justify-between ${
                    active
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                      : 'bg-zinc-900 border-zinc-800/80 text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${
                      active ? 'bg-blue-400' : 'bg-zinc-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Mode Accordion */}
        <div className="pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setIsManualModeOpen(!isManualModeOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors py-1"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Manual Repository Stats</span>
            </div>
            {isManualModeOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isManualModeOpen && (
            <div className="mt-3 flex flex-col gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-500">Stars</label>
                  <input
                    type="number"
                    min="0"
                    value={repo.stars}
                    onChange={(e) =>
                      setRepo({ ...repo, stars: Math.max(0, parseInt(e.target.value) || 0) }, false)
                    }
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-500">Forks</label>
                  <input
                    type="number"
                    min="0"
                    value={repo.forks}
                    onChange={(e) =>
                      setRepo({ ...repo, forks: Math.max(0, parseInt(e.target.value) || 0) }, false)
                    }
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-500">Owner Handle</label>
                <input
                  type="text"
                  value={repo.owner.login}
                  onChange={(e) =>
                    setRepo(
                      {
                        ...repo,
                        owner: { ...repo.owner, login: e.target.value },
                      },
                      false
                    )
                  }
                  className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-500">Primary Language</label>
                <input
                  type="text"
                  value={repo.primaryLanguage?.name || ''}
                  onChange={(e) =>
                    setRepo(
                      {
                        ...repo,
                        primaryLanguage: e.target.value
                          ? {
                              name: e.target.value,
                              color: repo.primaryLanguage?.color || '#3b82f6',
                            }
                          : null,
                      },
                      false
                    )
                  }
                  placeholder="e.g. Rust, Go, Python"
                  className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-500">Release Version</label>
                  <input
                    type="text"
                    value={repo.latestRelease?.tag || ''}
                    onChange={(e) =>
                      setRepo(
                        {
                          ...repo,
                          latestRelease: e.target.value
                            ? {
                                tag: e.target.value,
                                publishedAt:
                                  repo.latestRelease?.publishedAt || new Date().toISOString(),
                              }
                            : null,
                        },
                        false
                      )
                    }
                    placeholder="e.g. v2.0.1"
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-500">License</label>
                  <input
                    type="text"
                    value={repo.license || ''}
                    onChange={(e) =>
                      setRepo(
                        {
                          ...repo,
                          license: e.target.value ? e.target.value.toUpperCase() : null,
                        },
                        false
                      )
                    }
                    placeholder="e.g. MIT, Apache-2.0"
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
