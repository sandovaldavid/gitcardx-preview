'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, AlertCircle, X, CreditCard, Share2 } from 'lucide-react';
import { useCardStore, useIsInitialStreamPending } from '../state/useCardStore';
import { CardRenderer } from '@/cards/templates/CardTemplateRegistry';
import { useDelayedLoading } from '@/lib/useDelayedLoading';
import { SocialSimulator } from './SocialSimulator';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const InteractiveCanvas: React.FC = () => {
  const {
    repo,
    config,
    zoom,
    setZoom,
    showSafeZoneGuides,
    isFetchingRepo,
    fetchError,
    setFetchError,
    viewMode,
    setViewMode,
  } = useCardStore();

  const isInitialStreamPending = useIsInitialStreamPending();
  const isSlowFetching = useDelayedLoading(isFetchingRepo, 150);

  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(0.72);

  // Synchronously calculate ideal scale before first browser paint to prevent initial size jump
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function calculateScale() {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;

      const padding = 64;
      const availableW = Math.max(clientWidth - padding, 320);
      const availableH = Math.max(clientHeight - padding, 200);

      const scaleW = availableW / 1280;
      const scaleH = availableH / 640;
      const bestScale = Math.min(scaleW, scaleH, 1.0);

      setAutoScale(Number(bestScale.toFixed(3)));
    }

    calculateScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(calculateScale);
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const effectiveScale = autoScale * zoom;
  const repoIdentityKey = `${repo.owner.login}/${repo.name}`;

  return (
    <main
      ref={containerRef}
      aria-busy={isFetchingRepo || isInitialStreamPending}
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

      {/* VIEW 1: CARD STUDIO CANVAS */}
      {viewMode === 'canvas' ? (
        <>
          {!isInitialStreamPending && (
            <div
              data-testid="studio-card-stage"
              className={`relative shadow-2xl rounded-2xl transition-[opacity,transform] duration-200 ease-out ${
                isSlowFetching ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'
              }`}
              style={{
                width: 1280 * effectiveScale,
                height: 640 * effectiveScale,
              }}
            >
              <div
                key={repoIdentityKey}
                className="card-enter"
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
          )}

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

            <div className="w-px h-3 bg-zinc-700/60 mx-1" />

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
        <div
          className={`w-full h-full flex flex-col pt-12 overflow-y-auto transition-opacity duration-200 ${
            isSlowFetching ? 'opacity-60' : 'opacity-100'
          }`}
        >
          <SocialSimulator />
        </div>
      )}
    </main>
  );
};
