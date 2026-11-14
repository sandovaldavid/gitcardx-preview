'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Plus, Trash2, Download, Upload, Check, Sparkles } from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import { IndexedDBPatternPresetStorage } from '@/core/adapters/local/IndexedDBPatternPresetStorage';
import { FreeTierEntitlement } from '@/core/adapters/local/FreeTierEntitlement';
import { PatternPresetSchema, type PatternPreset } from '@/core/domain/schemas';
import { sanitizeClientImageUrl } from '@/core/security/ssrf';

const storage = new IndexedDBPatternPresetStorage();
const entitlement = new FreeTierEntitlement();

export const PatternPresetVault: React.FC = () => {
  const { config, setBackgroundPattern, updateConfig } = useCardStore();

  const [savedPresets, setSavedPresets] = useState<PatternPreset[]>([]);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPresets = entitlement.maxStoredPatternPresets();

  const refreshPresets = async () => {
    try {
      const list = await storage.listPatternPresets();
      setSavedPresets(list);
    } catch {
      setSavedPresets([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    storage
      .listPatternPresets()
      .then((list) => {
        if (isMounted) setSavedPresets(list);
      })
      .catch(() => {
        if (isMounted) setSavedPresets([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveCurrentPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPresetName.trim();
    if (!name) return;

    if (savedPresets.length >= maxPresets) {
      setVaultError(`Free tier limit reached (${maxPresets} Pattern Presets maximum).`);
      return;
    }

    const newPreset: PatternPreset = {
      id: `pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      pattern: config.backgroundPattern,
      customBackgroundUrl: sanitizeClientImageUrl(config.customBackgroundUrl) || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      PatternPresetSchema.parse(newPreset);
      await storage.savePatternPreset(newPreset);
      setNewPresetName('');
      setIsSavingNew(false);
      setVaultError(null);
      await refreshPresets();
    } catch (err: unknown) {
      setVaultError(
        err instanceof Error ? err.message : 'Failed to validate Pattern Preset schema'
      );
    }
  };

  const handleApplyPreset = (preset: PatternPreset) => {
    setBackgroundPattern(preset.pattern);
    if (preset.customBackgroundUrl !== undefined) {
      updateConfig({
        customBackgroundUrl: sanitizeClientImageUrl(preset.customBackgroundUrl) || undefined,
      });
    }
    setAppliedId(preset.id);
    setTimeout(() => setAppliedId(null), 2000);
  };

  const handleDeletePreset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await storage.deletePatternPreset(id);
    await refreshPresets();
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedPresets, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `gitframe-pattern-presets-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(parsed))
          throw new Error('File does not contain an array of Pattern Presets');

        let importedCount = 0;
        for (const item of parsed) {
          const valid = PatternPresetSchema.safeParse(item);
          if (valid.success && savedPresets.length + importedCount < maxPresets) {
            await storage.savePatternPreset(valid.data);
            importedCount++;
          }
        }
        await refreshPresets();
        setVaultError(null);
      } catch (_err) {
        setVaultError('Invalid Pattern Preset JSON format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800/80">
      {/* Vault Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Pattern Presets
          </span>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
          {savedPresets.length} / {maxPresets}
        </span>
      </div>

      {vaultError && (
        <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-[11px]">
          {vaultError}
        </div>
      )}

      {/* Save Current Pattern Button / Inline Form */}
      {!isSavingNew ? (
        <button
          type="button"
          onClick={() => setIsSavingNew(true)}
          disabled={savedPresets.length >= maxPresets}
          className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 disabled:opacity-50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Current Pattern as Preset</span>
        </button>
      ) : (
        <form
          onSubmit={handleSaveCurrentPreset}
          className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 animate-in fade-in duration-150"
        >
          <input
            type="text"
            required
            maxLength={60}
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset Name (e.g. Neon Blueprint)"
            autoFocus
            className="w-full h-8 px-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 outline-none"
          />

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!newPresetName.trim()}
              className="flex-1 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Preset
            </button>
            <button
              type="button"
              onClick={() => setIsSavingNew(false)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List of Saved Pattern Presets */}
      {savedPresets.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center flex flex-col items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-zinc-600" />
          <p className="text-[11px] text-zinc-500">
            No pattern presets saved yet. Customize opacity, scale or texture above and save your
            recipe here for quick 1-click reuse.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
          {savedPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                appliedId === preset.id
                  ? 'bg-blue-600/15 border-blue-500'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {preset.pattern.color ? (
                  <div
                    className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.pattern.color }}
                  />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-dashed border-zinc-600 shrink-0" />
                )}

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {preset.name}
                    </span>
                    {appliedId === preset.id && (
                      <span className="text-[10px] text-blue-400 font-mono flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Applied
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500">
                    {preset.pattern.id} • {Math.round((preset.pattern.opacity ?? 0.4) * 100)}% •{' '}
                    {Math.round((preset.pattern.scale ?? 1) * 100)}% scale
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDeletePreset(preset.id, e)}
                title="Delete preset"
                className="p-1 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Export / Import JSON Actions */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleExportJson}
          disabled={savedPresets.length === 0}
          className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Export Presets</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
        >
          <Upload className="w-3 h-3" />
          <span>Import Presets</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJson}
          className="hidden"
        />
      </div>
    </div>
  );
};
