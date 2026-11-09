'use client';

import React, { useState } from 'react';
import {
  LayoutTemplate,
  Palette as PaletteIcon,
  Sparkles,
  Layers,
  Type,
  Check,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Upload,
  Trash2,
} from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import { CARD_TEMPLATES } from '@/cards/templates/CardTemplateRegistry';
import { PRESET_PALETTES, ThemeEngine } from '@/core/theme/ThemeEngine';
import type { BackgroundPatternConfig } from '@/core/domain/schemas';
import { BrandKitVault } from './BrandKitVault';
import { PatternPresetVault } from './PatternPresetVault';

export const RightInspector: React.FC = () => {
  const {
    config,
    setTemplateId,
    setPalette,
    setBackgroundPattern,
    updateConfig,
    activeRightTab,
    setActiveRightTab,
    repo,
  } = useCardStore();

  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setImageUploadError('Backdrop texture exceeds 500 KB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setImageUploadError(null);
        updateConfig({ customBackgroundUrl: result });
      }
    };
    reader.onerror = () => {
      setImageUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const templateList = Object.values(CARD_TEMPLATES);

  const patternList: Array<{
    id: BackgroundPatternConfig['id'];
    name: string;
    description: string;
  }> = [
    {
      id: 'architectural-grid',
      name: 'Architectural Grid',
      description: 'Blueprint grid with coordinate crosshairs',
    },
    {
      id: 'dot-matrix',
      name: 'Dot Matrix',
      description: 'Polka dot developer matrix with radial fade',
    },
    {
      id: 'radial-spotlight',
      name: 'Radial Spotlight',
      description: 'Luminous accent glow from top',
    },
    { id: 'aurora-mesh', name: 'Aurora Mesh', description: 'Organic fluid gradient glow' },
    {
      id: 'topographic-contours',
      name: 'Topographic Lines',
      description: 'Flowing topographic elevation curves',
    },
    {
      id: 'custom-image',
      name: 'Custom Image',
      description: 'Upload or link custom backdrop texture',
    },
  ];

  // Contrast check
  const wcagRating = ThemeEngine.checkWcag(config.palette.background, config.palette.text);

  return (
    <aside className="w-80 lg:w-92 border-l border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto z-20 shrink-0">
      {/* Tab Switcher Header */}
      <div className="p-2 border-b border-zinc-800/80 grid grid-cols-5 gap-1">
        <button
          type="button"
          onClick={() => setActiveRightTab('templates')}
          title="Templates"
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-medium transition-all ${
            activeRightTab === 'templates'
              ? 'bg-zinc-800 text-blue-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5 mb-1" />
          <span>Templates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRightTab('theme')}
          title="Theme & Colors"
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-medium transition-all ${
            activeRightTab === 'theme'
              ? 'bg-zinc-800 text-blue-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <PaletteIcon className="w-3.5 h-3.5 mb-1" />
          <span>Theme</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRightTab('background')}
          title="Backgrounds"
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-medium transition-all ${
            activeRightTab === 'background'
              ? 'bg-zinc-800 text-blue-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 mb-1" />
          <span>Pattern</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRightTab('typography')}
          title="Typography"
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-medium transition-all ${
            activeRightTab === 'typography'
              ? 'bg-zinc-800 text-blue-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Type className="w-3.5 h-3.5 mb-1" />
          <span>Fonts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveRightTab('vault')}
          title="Brand Vault"
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-medium transition-all ${
            activeRightTab === 'vault'
              ? 'bg-zinc-800 text-blue-400 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 mb-1" />
          <span>Vault</span>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* TAB 1: TEMPLATES */}
        {activeRightTab === 'templates' && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Select Card Template ({templateList.length})
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {templateList.map((tmpl) => {
                const isSelected = config.templateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        {tmpl.name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">{tmpl.description}</p>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950/60 px-2 py-0.5 rounded w-fit border border-zinc-800/60">
                      {tmpl.recommendedFor}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: THEME & COLORS */}
        {activeRightTab === 'theme' && (
          <div className="flex flex-col gap-6">
            {/* Contrast Indicator Badge */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {wcagRating.aaa ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : wcagRating.aa ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-200">
                    WCAG Contrast: {wcagRating.ratio}:1
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {wcagRating.aaa
                      ? 'Grade AAA — Ultra High Legibility'
                      : wcagRating.aa
                        ? 'Grade AA — Standard Accessible'
                        : 'Low Contrast Warning'}
                  </span>
                </div>
              </div>

              {!wcagRating.aa && (
                <button
                  type="button"
                  onClick={() => {
                    const adjusted = ThemeEngine.ensureReadableText(
                      config.palette.background,
                      config.palette.text
                    );
                    setPalette({ ...config.palette, text: adjusted });
                  }}
                  className="px-2 py-1 text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-500/20"
                >
                  Auto-Fix
                </button>
              )}
            </div>

            {/* Auto Theme from Language */}
            {repo.primaryLanguage && (
              <button
                type="button"
                onClick={() => {
                  const autoPal = ThemeEngine.generatePaletteFromLanguageColor(
                    repo.primaryLanguage?.color || '#3b82f6',
                    'dark'
                  );
                  setPalette(autoPal);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Sync with {repo.primaryLanguage.name} Color</span>
                <div
                  className="w-3 h-3 rounded-full ml-1"
                  style={{ backgroundColor: repo.primaryLanguage.color }}
                />
              </button>
            )}

            {/* Preset Palettes */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Preset Palettes
              </span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESET_PALETTES).map(([key, pal]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPalette(pal)}
                    className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all text-left flex flex-col gap-2"
                  >
                    <span className="text-xs font-medium text-zinc-300 capitalize">
                      {key.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: pal.background }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: pal.accent }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: pal.text }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/80">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Custom Palette
              </span>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Background</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">
                    {config.palette.background}
                  </span>
                  <input
                    type="color"
                    value={config.palette.background}
                    onChange={(e) => setPalette({ ...config.palette, background: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Primary Text</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">{config.palette.text}</span>
                  <input
                    type="color"
                    value={config.palette.text}
                    onChange={(e) => setPalette({ ...config.palette, text: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Accent Color</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">{config.palette.accent}</span>
                  <input
                    type="color"
                    value={config.palette.accent}
                    onChange={(e) => setPalette({ ...config.palette, accent: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Border Color</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500">{config.palette.border}</span>
                  <input
                    type="color"
                    value={config.palette.border}
                    onChange={(e) => setPalette({ ...config.palette, border: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BACKGROUND PATTERNS */}
        {activeRightTab === 'background' && (
          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Procedural Patterns
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {patternList.map((pat) => {
                const active = config.backgroundPattern.id === pat.id;
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setBackgroundPattern({ id: pat.id })}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      active
                        ? 'bg-blue-600/10 border-blue-500'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">{pat.name}</span>
                      {active && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <span className="text-[11px] text-zinc-500">{pat.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Image Backdrop Controls */}
            {config.backgroundPattern.id === 'custom-image' && (
              <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Backdrop Texture / Image
                </span>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-200 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Upload Texture (Max 500 KB)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleCustomImageUpload}
                    />
                  </label>
                  {imageUploadError && (
                    <span className="text-[11px] text-red-400">{imageUploadError}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-zinc-400">Or Image URL</span>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      value={config.customBackgroundUrl || ''}
                      onChange={(e) => updateConfig({ customBackgroundUrl: e.target.value })}
                      placeholder="https://... or data:image/..."
                      className="flex-1 h-8 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 outline-none"
                    />
                    {config.customBackgroundUrl && (
                      <button
                        type="button"
                        onClick={() => updateConfig({ customBackgroundUrl: undefined })}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Clear backdrop image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pattern Opacity Slider */}
            <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Pattern Opacity</span>
                <span className="text-xs font-mono text-zinc-300">
                  {Math.round((config.backgroundPattern.opacity ?? 0.4) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((config.backgroundPattern.opacity ?? 0.4) * 100)}
                onChange={(e) => setBackgroundPattern({ opacity: parseInt(e.target.value) / 100 })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Pattern Scale Slider */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Pattern Scale</span>
                <span className="text-xs font-mono text-zinc-300">
                  {Math.round((config.backgroundPattern.scale ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="300"
                step="5"
                value={Math.round((config.backgroundPattern.scale ?? 1) * 100)}
                onChange={(e) => setBackgroundPattern({ scale: parseInt(e.target.value) / 100 })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Pattern Tint / Color Override */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Pattern Color Override</span>
                {config.backgroundPattern.color && (
                  <button
                    type="button"
                    onClick={() => setBackgroundPattern({ color: undefined })}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Reset to theme
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.backgroundPattern.color || config.palette.accent}
                  onChange={(e) => setBackgroundPattern({ color: e.target.value })}
                  className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={config.backgroundPattern.color || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setBackgroundPattern({ color: undefined });
                    } else if (val.startsWith('#')) {
                      setBackgroundPattern({ color: val });
                    }
                  }}
                  placeholder={config.palette.accent}
                  className="flex-1 h-7 px-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Pattern Presets Vault */}
            <PatternPresetVault />
          </div>
        )}

        {/* TAB 4: TYPOGRAPHY */}
        {activeRightTab === 'typography' && (
          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Font Pairings
            </span>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-zinc-400">Heading Font</label>
              <select
                value={config.typography.fontHeading}
                onChange={(e) =>
                  updateConfig({
                    typography: { ...config.typography, fontHeading: e.target.value },
                  })
                }
                className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 outline-none"
              >
                <option value="Inter">Inter (Clean Modern Sans)</option>
                <option value="Geist">Geist (Developer Aesthetic)</option>
                <option value="Space Grotesk">Space Grotesk (Tech / Brutalist)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (High-End SaaS)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-zinc-400">Monospace Font</label>
              <select
                value={config.typography.fontMono}
                onChange={(e) =>
                  updateConfig({
                    typography: { ...config.typography, fontMono: e.target.value },
                  })
                }
                className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 outline-none"
              >
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Fira Code">Fira Code</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 5: BRAND KIT VAULT */}
        {activeRightTab === 'vault' && <BrandKitVault />}
      </div>
    </aside>
  );
};
