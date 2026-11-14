'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Eye,
  EyeOff,
  Terminal,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlignLeft,
  AlignCenter,
  Layout,
  User,
  Star,
  GitFork,
  CircleDot,
  MessageSquare,
  Tag,
  Scale,
  Users,
  Layers,
  Code2,
} from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import { normalizeTemplateId, type CardVisibility } from '@/core/domain/schemas';
import { sanitizeClientImageUrl } from '@/core/security/ssrf';
import {
  CARD_TEMPLATES,
  getAllLayerVisibilityStates,
  getLayerVisibilityState,
  getTemplateCapabilities,
  type LayerUnavailableReason,
} from '@/cards/templates/CardTemplateRegistry';

function getUnavailableLabel(
  reason: LayerUnavailableReason | undefined,
  stackHidden: boolean,
  ownerHidden: boolean
): string {
  switch (reason) {
    case 'not-in-template':
      return 'Not in template';
    case 'no-data':
      return 'No data';
    case 'parent-hidden':
      if (ownerHidden && !stackHidden) return 'Owner off';
      if (stackHidden) return 'Stack off';
      return 'Parent off';
    default:
      return 'Unavailable';
  }
}

export const LeftInspector: React.FC = () => {
  const { config, updateConfig, setContentAlign, toggleVisibility, repo, updateRepo } =
    useCardStore();
  const [isManualModeOpen, setIsManualModeOpen] = useState(false);
  const [logoDraft, setLogoDraft] = useState<string | null>(null);

  const displayedLogoUrl = logoDraft ?? (config.customLogoUrl || '');
  const logoUrlError =
    logoDraft !== null && logoDraft.trim() !== '' && !sanitizeClientImageUrl(logoDraft)
      ? 'Use an https:// URL or valid base64 image data URI.'
      : null;

  const handleLogoUrlChange = (nextVal: string) => {
    if (!nextVal.trim()) {
      setLogoDraft(null);
      updateConfig({ customLogoUrl: undefined });
      return;
    }

    const safe = sanitizeClientImageUrl(nextVal);
    if (safe) {
      setLogoDraft(null);
      updateConfig({ customLogoUrl: safe });
    } else {
      setLogoDraft(nextVal);
    }
  };

  const templateId = normalizeTemplateId(config.templateId);
  const templateDef = CARD_TEMPLATES[templateId];
  const capabilities = getTemplateCapabilities(templateId);
  const visibilityKeys = Object.keys(capabilities.visibility) as Array<keyof CardVisibility>;
  const layerStates = getAllLayerVisibilityStates(visibilityKeys, templateId, repo, config);
  const layerStateByKey = new Map(layerStates.map((state) => [state.key, state]));
  const supportedLayerCount = layerStates.filter((state) => state.supportedByTemplate).length;
  const activeLayerCount = layerStates.filter((state) => state.visibleOnCard).length;
  const installSupported = capabilities.visibility.installCommand;
  const installVisible = installSupported && config.visibility.installCommand;
  const customLogoSupported = capabilities.supportsCustomLogo;
  const customLogoHiddenByAuthor = customLogoSupported && !config.visibility.author;

  const elementLayers: Array<{
    key: keyof CardVisibility;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: 'author', label: 'Owner / Avatar', icon: User },
    { key: 'tagline', label: 'Tagline Description', icon: AlignLeft },
    { key: 'stars', label: 'GitHub Stars', icon: Star },
    { key: 'forks', label: 'Forks Count', icon: GitFork },
    { key: 'issues', label: 'Open Issues', icon: CircleDot },
    { key: 'discussions', label: 'Discussions', icon: MessageSquare },
    { key: 'release', label: 'Latest Release', icon: Tag },
    { key: 'license', label: 'License Badge', icon: Scale },
    { key: 'techStack', label: 'Tech Stack Badges', icon: Layers },
    { key: 'languageLogos', label: 'Official Logos', icon: Code2 },
    { key: 'installCommand', label: 'Install Command', icon: Terminal },
    { key: 'contributors', label: 'Contributors Row', icon: Users },
  ];

  return (
    <aside className="w-full lg:w-80 xl:w-88 border-r border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex flex-col h-full lg:h-[calc(100vh-3.5rem)] overflow-y-auto z-20 shrink-0">
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
              aria-pressed={config.contentAlign === 'left'}
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
              aria-pressed={config.contentAlign === 'center'}
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
          <label
            htmlFor="card-title-input"
            className="text-xs font-medium text-zinc-300 flex items-center justify-between"
          >
            <span>Card Title</span>
            <span className="text-[10px] font-mono text-zinc-400">{config.title.length}/100</span>
          </label>
          <input
            id="card-title-input"
            type="text"
            value={config.title}
            maxLength={100}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="e.g. Next.js"
            className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <span className="text-blue-400 font-mono">*keyword*</span>
            <span>wraps with accent color</span>
          </span>
        </div>

        {/* Tagline Textarea */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="card-tagline-input"
            className="text-xs font-medium text-zinc-300 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <span>Tagline / Description</span>
              <span className="text-[10px] font-mono text-zinc-400">
                {config.tagline.length}/300
              </span>
            </span>
            <button
              type="button"
              onClick={() => toggleVisibility('tagline')}
              aria-label={
                config.visibility.tagline ? 'Hide tagline on card' : 'Show tagline on card'
              }
              title={config.visibility.tagline ? 'Hide tagline on card' : 'Show tagline on card'}
              className="p-1 rounded hover:bg-zinc-800/80 transition-colors"
            >
              {config.visibility.tagline ? (
                <Eye className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
              )}
            </button>
          </label>
          <textarea
            id="card-tagline-input"
            value={config.tagline}
            maxLength={300}
            rows={3}
            onChange={(e) => updateConfig({ tagline: e.target.value })}
            placeholder="Short, impactful description of your project..."
            className={`w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none ${
              !config.visibility.tagline ? 'opacity-40' : ''
            }`}
          />
        </div>

        {/* Install Command Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="card-install-input"
              className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 min-w-0"
            >
              <Terminal
                className={`w-3.5 h-3.5 shrink-0 ${
                  installSupported ? 'text-blue-400' : 'text-zinc-500'
                }`}
              />
              <span className="truncate">Install Command / Snippet</span>
            </label>
            <div className="flex items-center gap-1.5 shrink-0">
              {!installSupported && (
                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                  Not in template
                </span>
              )}
              <button
                type="button"
                disabled={!installSupported}
                onClick={() => toggleVisibility('installCommand')}
                aria-label={
                  !installSupported
                    ? `Install command snippet is not rendered in ${templateDef.name}`
                    : installVisible
                      ? 'Hide install command on card'
                      : 'Show install command on card'
                }
                aria-pressed={installVisible}
                title={
                  !installSupported
                    ? `Install command snippet is not rendered in ${templateDef.name}`
                    : installVisible
                      ? 'Hide install command on card'
                      : 'Show install command on card'
                }
                className={`p-1 rounded transition-colors ${
                  !installSupported ? 'text-zinc-600 cursor-not-allowed' : 'hover:bg-zinc-800/80'
                }`}
              >
                {installVisible ? (
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <EyeOff
                    className={`w-3.5 h-3.5 ${installSupported ? 'text-zinc-400' : 'text-zinc-600'}`}
                  />
                )}
              </button>
            </div>
          </div>
          <input
            id="card-install-input"
            type="text"
            disabled={!installSupported}
            value={config.installCommand || ''}
            onChange={(e) => updateConfig({ installCommand: e.target.value })}
            placeholder="e.g. bun add my-package"
            title={!installSupported ? `Not rendered in ${templateDef.name}` : undefined}
            className={`w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
              !installSupported
                ? 'opacity-40 cursor-not-allowed'
                : !installVisible
                  ? 'opacity-40'
                  : ''
            }`}
          />
        </div>

        {/* Custom Logo URL */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="card-logo-url-input"
              className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 min-w-0"
            >
              <ImageIcon
                className={`w-3.5 h-3.5 shrink-0 ${
                  customLogoSupported ? 'text-blue-400' : 'text-zinc-500'
                }`}
              />
              <span className="truncate">Custom Logo URL (optional)</span>
            </label>
            {!customLogoSupported ? (
              <span className="text-[10px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                Not in template
              </span>
            ) : customLogoHiddenByAuthor ? (
              <span className="text-[10px] font-medium text-amber-300 bg-amber-950/50 border border-amber-800/60 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                Owner hidden
              </span>
            ) : null}
          </div>
          <input
            id="card-logo-url-input"
            type="url"
            disabled={!customLogoSupported}
            value={displayedLogoUrl}
            onChange={(e) => handleLogoUrlChange(e.target.value)}
            onBlur={() => {
              if (logoDraft !== null && !logoDraft.trim()) {
                setLogoDraft(null);
              }
            }}
            placeholder="https://... or data:image/png;base64,..."
            title={
              !customLogoSupported
                ? `Custom logo is not rendered in ${templateDef.name}`
                : customLogoHiddenByAuthor
                  ? 'Enable Owner / Avatar to show custom logo on card'
                  : undefined
            }
            className={`w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
              !customLogoSupported
                ? 'opacity-40 cursor-not-allowed'
                : customLogoHiddenByAuthor
                  ? 'opacity-60'
                  : ''
            }`}
          />
          {logoUrlError && <span className="text-[11px] text-red-400">{logoUrlError}</span>}
        </div>

        {/* Card Elements & Layers Visibility */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Visible Elements & Layers</span>
            </label>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded shrink-0">
              {`${activeLayerCount}/${supportedLayerCount} active`}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {elementLayers.map(({ key, label, icon: Icon }) => {
              const state =
                layerStateByKey.get(key) ?? getLayerVisibilityState(key, templateId, repo, config);
              const isInteractive = state.supportedByTemplate && state.available;
              const active = state.visibleOnCard;
              const userHidden = isInteractive && !state.enabled;
              const unavailableLabel = isInteractive
                ? null
                : getUnavailableLabel(
                    state.unavailableReason,
                    !config.visibility.techStack,
                    capabilities.primaryLanguageLogoMode === 'with-author' &&
                      !config.visibility.author
                  );
              const buttonLabel = !state.supportedByTemplate
                ? `${label} is not rendered in ${templateDef.name}`
                : !state.available
                  ? `${label} unavailable (${unavailableLabel})`
                  : active
                    ? `Hide ${label} on card`
                    : `Show ${label} on card`;

              return (
                <div
                  key={key}
                  data-layer-key={key}
                  data-layer-status={
                    active ? 'active' : userHidden ? 'hidden' : state.unavailableReason
                  }
                  onClick={isInteractive ? () => toggleVisibility(key) : undefined}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs select-none transition-all ${
                    active
                      ? 'bg-zinc-900/70 border-zinc-800/90 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer'
                      : isInteractive
                        ? 'bg-zinc-950/40 border-zinc-900/80 text-zinc-400 hover:text-zinc-300 hover:border-zinc-800/50 cursor-pointer'
                        : 'bg-zinc-950/30 border-zinc-900/60 text-zinc-400 opacity-65 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        active ? 'text-blue-400' : 'text-zinc-500'
                      }`}
                    />
                    <span
                      className={`truncate font-medium transition-colors ${
                        active
                          ? 'text-zinc-200'
                          : userHidden
                            ? 'line-through text-zinc-400'
                            : 'text-zinc-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {unavailableLabel && (
                      <span className="text-[10px] font-medium text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {unavailableLabel}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={!isInteractive}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInteractive) toggleVisibility(key);
                      }}
                      aria-label={buttonLabel}
                      aria-pressed={active}
                      title={buttonLabel}
                      className={`p-1 rounded-md transition-colors ${
                        !isInteractive
                          ? 'text-zinc-600 cursor-not-allowed'
                          : active
                            ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                    >
                      {active ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
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
                  <label htmlFor="manual-stars-input" className="text-[11px] text-zinc-400">
                    Stars
                  </label>
                  <input
                    id="manual-stars-input"
                    type="number"
                    min="0"
                    value={repo.stars}
                    onChange={(e) =>
                      updateRepo({ stars: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="manual-forks-input" className="text-[11px] text-zinc-400">
                    Forks
                  </label>
                  <input
                    id="manual-forks-input"
                    type="number"
                    min="0"
                    value={repo.forks}
                    onChange={(e) =>
                      updateRepo({ forks: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor="manual-issues-input" className="text-[11px] text-zinc-400">
                    Open Issues
                  </label>
                  <input
                    id="manual-issues-input"
                    type="number"
                    min="0"
                    value={repo.openIssuesCount ?? ''}
                    placeholder="-"
                    onChange={(e) =>
                      updateRepo({
                        openIssuesCount:
                          e.target.value === ''
                            ? undefined
                            : Math.max(0, parseInt(e.target.value, 10)),
                      })
                    }
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="manual-discussions-input" className="text-[11px] text-zinc-400">
                    Discussions
                  </label>
                  <input
                    id="manual-discussions-input"
                    type="number"
                    min="0"
                    value={repo.discussionsCount ?? ''}
                    placeholder="-"
                    onChange={(e) =>
                      updateRepo({
                        discussionsCount:
                          e.target.value === ''
                            ? undefined
                            : Math.max(0, parseInt(e.target.value, 10)),
                      })
                    }
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="manual-owner-input" className="text-[11px] text-zinc-400">
                  Owner Handle
                </label>
                <input
                  id="manual-owner-input"
                  type="text"
                  value={repo.owner.login}
                  onChange={(e) =>
                    updateRepo({
                      owner: { ...repo.owner, login: e.target.value },
                    })
                  }
                  className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>

              <div>
                <label htmlFor="manual-lang-input" className="text-[11px] text-zinc-400">
                  Primary Language
                </label>
                <input
                  id="manual-lang-input"
                  type="text"
                  value={repo.primaryLanguage?.name || ''}
                  onChange={(e) =>
                    updateRepo({
                      primaryLanguage: e.target.value
                        ? {
                            name: e.target.value,
                            color: repo.primaryLanguage?.color || '#3b82f6',
                          }
                        : null,
                    })
                  }
                  placeholder="e.g. Rust, Go, Python"
                  className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor="manual-release-input" className="text-[11px] text-zinc-400">
                    Release Version
                  </label>
                  <input
                    id="manual-release-input"
                    type="text"
                    value={repo.latestRelease?.tag || ''}
                    onChange={(e) =>
                      updateRepo({
                        latestRelease: e.target.value
                          ? {
                              tag: e.target.value,
                              publishedAt:
                                repo.latestRelease?.publishedAt || new Date().toISOString(),
                            }
                          : null,
                      })
                    }
                    placeholder="e.g. v2.0.1"
                    className="w-full h-8 px-2 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="manual-license-input" className="text-[11px] text-zinc-400">
                    License
                  </label>
                  <input
                    id="manual-license-input"
                    type="text"
                    value={repo.license || ''}
                    onChange={(e) =>
                      updateRepo({
                        license: e.target.value ? e.target.value.toUpperCase() : null,
                      })
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
