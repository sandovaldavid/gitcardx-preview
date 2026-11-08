'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Plus, Trash2, Download, Upload, Check, Layers } from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import { IndexedDBBrandKitStorage } from '@/core/adapters/local/IndexedDBBrandKitStorage';
import { FreeTierEntitlement } from '@/core/adapters/local/FreeTierEntitlement';
import { BrandKitSchema, type BrandKit } from '@/core/domain/schemas';

const storage = new IndexedDBBrandKitStorage();
const entitlement = new FreeTierEntitlement();

export const BrandKitVault: React.FC = () => {
  const { config, setTemplateId, setPalette, setBackgroundPattern, updateConfig } = useCardStore();

  const [savedKits, setSavedKits] = useState<BrandKit[]>([]);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const [newKitSignature, setNewKitSignature] = useState('');
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxKits = entitlement.maxStoredBrandKits();

  // Load kits from IndexedDB
  const refreshKits = async () => {
    try {
      const list = await storage.listBrandKits();
      setSavedKits(list);
    } catch {
      setSavedKits([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    storage
      .listBrandKits()
      .then((list) => {
        if (isMounted) setSavedKits(list);
      })
      .catch(() => {
        if (isMounted) setSavedKits([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveCurrentAsKit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newKitName.trim();
    if (!name) return;

    if (savedKits.length >= maxKits) {
      setVaultError(`Free tier limit reached (${maxKits} Brand Kits maximum).`);
      return;
    }

    const newKit: BrandKit = {
      id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      templateId: config.templateId,
      palette: config.palette,
      typography: config.typography,
      backgroundPattern: config.backgroundPattern,
      customLogoUrl: config.customLogoUrl,
      signature: newKitSignature.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      BrandKitSchema.parse(newKit);
      await storage.saveBrandKit(newKit);
      setNewKitName('');
      setNewKitSignature('');
      setIsSavingNew(false);
      setVaultError(null);
      await refreshKits();
    } catch (err: unknown) {
      setVaultError(err instanceof Error ? err.message : 'Failed to validate Brand Kit schema');
    }
  };

  const handleApplyKit = (kit: BrandKit) => {
    setTemplateId(kit.templateId);
    setPalette(kit.palette);
    setBackgroundPattern(kit.backgroundPattern);
    updateConfig({
      typography: kit.typography,
      customLogoUrl: kit.customLogoUrl,
    });
    setAppliedId(kit.id);
    setTimeout(() => setAppliedId(null), 2000);
  };

  const handleDeleteKit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await storage.deleteBrandKit(id);
    await refreshKits();
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedKits, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `gitframe-brand-kits-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('File does not contain an array of Brand Kits');

        let importedCount = 0;
        for (const item of parsed) {
          const valid = BrandKitSchema.safeParse(item);
          if (valid.success && savedKits.length + importedCount < maxKits) {
            await storage.saveBrandKit(valid.data);
            importedCount++;
          }
        }
        await refreshKits();
        setVaultError(null);
      } catch (_err) {
        setVaultError('Invalid Brand Kit JSON format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Vault Status Header */}
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bookmark className="w-4 h-4 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">Local Brand Vault</span>
            <span className="text-[11px] text-zinc-400">Stored privately in IndexedDB</span>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
          {savedKits.length} / {maxKits} Kits
        </span>
      </div>

      {vaultError && (
        <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs">
          {vaultError}
        </div>
      )}

      {/* Save Current Style Button / Form */}
      {!isSavingNew ? (
        <button
          type="button"
          onClick={() => setIsSavingNew(true)}
          disabled={savedKits.length >= maxKits}
          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Save Current Style as Brand Kit</span>
        </button>
      ) : (
        <form
          onSubmit={handleSaveCurrentAsKit}
          className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2.5 animate-in fade-in duration-150"
        >
          <span className="text-xs font-semibold text-zinc-300">New Brand Kit</span>
          <input
            type="text"
            value={newKitName}
            onChange={(e) => setNewKitName(e.target.value)}
            placeholder="Kit name (e.g. My OSS Identity)"
            maxLength={60}
            autoFocus
            className="w-full h-8 px-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
          />
          <input
            type="text"
            value={newKitSignature}
            onChange={(e) => setNewKitSignature(e.target.value)}
            placeholder="Author signature / tagline (optional)"
            maxLength={80}
            className="w-full h-8 px-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
          />

          <div className="flex items-center gap-2 mt-1">
            <button
              type="submit"
              disabled={!newKitName.trim()}
              className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold transition-colors"
            >
              Save Kit
            </button>
            <button
              type="button"
              onClick={() => setIsSavingNew(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List of Saved Brand Kits */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Saved Kits ({savedKits.length})
        </span>

        {savedKits.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center flex flex-col items-center gap-2">
            <Layers className="w-6 h-6 text-zinc-600" />
            <p className="text-xs text-zinc-500 max-w-xs">
              No Brand Kits saved yet. Save your favorite palette, template, and pattern
              combinations here for 1-click reuse across all your repositories.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {savedKits.map((kit) => (
              <div
                key={kit.id}
                onClick={() => handleApplyKit(kit)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                  appliedId === kit.id
                    ? 'bg-blue-600/10 border-blue-500'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200 truncate">{kit.name}</span>
                    {appliedId === kit.id && (
                      <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Applied
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: kit.palette.background }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: kit.palette.accent }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: kit.palette.text }}
                    />
                    <span className="text-[10px] font-mono text-zinc-500 ml-1">
                      {kit.templateId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteKit(kit.id, e)}
                    title="Delete Kit"
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export / Import JSON Actions */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleExportJson}
          disabled={savedKits.length === 0}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import JSON</span>
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
