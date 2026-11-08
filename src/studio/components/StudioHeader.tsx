'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Undo2, Redo2, Scan, Download, RotateCcw, Sparkles } from 'lucide-react';
import { Omnibar } from './Omnibar';
import { useCardStore } from '../state/useCardStore';

export const StudioHeader: React.FC = () => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    resetConfig,
    showSafeZoneGuides,
    toggleSafeZoneGuides,
    setIsExportModalOpen,
  } = useCardStore();

  // Listen for global Undo/Redo shortcuts (Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          if (canRedo()) redo();
        } else {
          e.preventDefault();
          if (canUndo()) undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo()) redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-40 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">
              GitCard<span className="text-blue-500">X</span>
            </span>
            <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider">
              Preview
            </span>
          </div>
        </Link>
      </div>

      {/* Omnibar Center */}
      <div className="flex-1 flex justify-center max-w-2xl px-2">
        <Omnibar />
      </div>

      {/* Toolbar Right */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (⌘Z)"
            className="p-1.5 text-zinc-400 hover:text-white disabled:text-zinc-600 disabled:hover:text-zinc-600 rounded transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (⇧⌘Z)"
            className="p-1.5 text-zinc-400 hover:text-white disabled:text-zinc-600 disabled:hover:text-zinc-600 rounded transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Safe Zone Toggle */}
        <button
          type="button"
          onClick={toggleSafeZoneGuides}
          title="Toggle 40px Safe Zone Guides"
          className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
            showSafeZoneGuides
              ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span className="hidden lg:inline text-xs">Safe Zone</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={resetConfig}
          title="Reset to defaults"
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Card</span>
        </button>
      </div>
    </header>
  );
};
