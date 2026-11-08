'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  AlertCircle,
  X,
  CreditCard,
  Share2,
  Edit3,
} from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import { CardRenderer } from '@/cards/templates/CardTemplateRegistry';
import { SocialSimulator } from './SocialSimulator';

export const InteractiveCanvas: React.FC = () => {
  const {
    repo,
    config,
    updateConfig,
    zoom,
    setZoom,
    showSafeZoneGuides,
    isFetchingRepo,
    fetchError,
    setFetchError,
    viewMode,
    setViewMode,
  } = useCardStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(0.7);
  const [isQuickEditing, setIsQuickEditing] = useState(false);

  // Close Quick Edit on Escape key press anywhere
  useEffect(() => {
    if (!isQuickEditing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickEditing(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickEditing]);

  // Dynamically calculate the ideal scale to fit the card inside the container
  useEffect(() => {
    function calculateScale() {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 64; // Available padding around card
      const availableW = Math.max(clientWidth - padding, 320);
      const availableH = Math.max(clientHeight - padding, 200);

      const scaleW = availableW / 1280;
      const scaleH = availableH / 640;
      const bestScale = Math.min(scaleW, scaleH, 1.0);

      setAutoScale(Number(bestScale.toFixed(3)));
    }

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const effectiveScale = autoScale * zoom;

  return (
    <main
      ref={containerRef}
      className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-zinc-950 select-none p-4"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top View Mode Switcher */}
      <div className="absolute top-4 z-30 flex items-center bg-zinc-900/90 border border-zinc-800/80 rounded-full p-1 backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={() => setViewMode('canvas')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            viewMode === 'canvas'
              ? 'bg-blue-600 text-white shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Card Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('social')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            viewMode === 'social'
              ? 'bg-blue-600 text-white shadow'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Simulator</span>
        </button>
      </div>

      {/* Error Notification Toast */}
      {fetchError && (
        <div className="absolute top-14 z-50 px-4 py-2.5 rounded-xl bg-red-950/90 border border-red-800 text-red-200 text-xs flex items-center gap-2.5 shadow-xl animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{fetchError}</span>
          <button
            type="button"
            onClick={() => setFetchError(null)}
            className="p-1 hover:bg-red-900/50 rounded-full text-red-400 hover:text-red-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isFetchingRepo && (
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-medium text-zinc-300">
            Fetching repository from GitHub GraphQL v4...
          </span>
        </div>
      )}

      {/* VIEW 1: CARD STUDIO CANVAS */}
      {viewMode === 'canvas' ? (
        <>
          {/* In-Situ Quick Edit Floating Panel with Backdrop */}
          {isQuickEditing && (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100"
              onClick={() => setIsQuickEditing(false)}
            >
              <div
                className="relative w-full max-w-lg p-5 rounded-2xl bg-zinc-950 border border-zinc-700/80 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
                    <Edit3 className="w-4 h-4 text-blue-400" />
                    <span>In-Situ Card Text Editor</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuickEditing(false)}
                    className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                      <span className="font-medium text-zinc-300">Card Title</span>
                      <span className="text-blue-400 font-mono text-[10px]">
                        Tip: Use *word* or **word** for accent color
                      </span>
                    </div>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setIsQuickEditing(false);
                        } else if (e.key === 'Enter') {
                          setIsQuickEditing(false);
                        }
                      }}
                      placeholder="Project Title"
                      className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-700/80 text-sm text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
                      <span className="font-medium text-zinc-300">Tagline / Description</span>
                    </div>
                    <textarea
                      value={config.tagline}
                      rows={2}
                      onChange={(e) => updateConfig({ tagline: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.stopPropagation();
                          setIsQuickEditing(false);
                        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          setIsQuickEditing(false);
                        }
                      }}
                      placeholder="Short impactful tagline..."
                      className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700/80 text-sm text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[11px] text-zinc-500">
                      Press{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] text-zinc-400">
                        Esc
                      </kbd>{' '}
                      to close
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsQuickEditing(false)}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className="relative shadow-2xl rounded-2xl transition-transform duration-100 ease-out group"
            style={{
              width: 1280 * effectiveScale,
              height: 640 * effectiveScale,
            }}
            onDoubleClick={() => setIsQuickEditing(true)}
          >
            {/* Quick Edit Overlay Trigger */}
            <button
              type="button"
              onClick={() => setIsQuickEditing(true)}
              className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-300 hover:text-white shadow-lg backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
              title="Quick edit title & tagline directly"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Quick Edit</span>
            </button>

            <div
              style={{
                width: 1280,
                height: 640,
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow:
                  '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              }}
            >
              <CardRenderer repo={repo} config={config} showSafeZoneGuides={showSafeZoneGuides} />
            </div>
          </div>

          {/* Zoom Controls Floating Bar */}
          <div className="absolute bottom-5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-md shadow-xl text-zinc-300">
            <button
              type="button"
              onClick={() => setZoom(zoom - 0.1)}
              title="Zoom Out"
              className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-mono px-2 font-medium min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={() => setZoom(zoom + 0.1)}
              title="Zoom In"
              className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3 bg-zinc-700/60 mx-1" />

            <button
              type="button"
              onClick={() => setZoom(1.0)}
              title="Fit to Screen (100%)"
              className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-full transition-colors text-xs"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        /* VIEW 2: SOCIAL SIMULATOR */
        <div className="w-full h-full flex flex-col pt-12 overflow-y-auto">
          <SocialSimulator />
        </div>
      )}
    </main>
  );
};
