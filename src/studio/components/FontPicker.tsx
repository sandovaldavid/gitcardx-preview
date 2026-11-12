'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Loader2, Search, X } from 'lucide-react';
import {
  CURATED_HEADING_FONTS,
  CURATED_MONO_FONTS,
  filterFontCatalog,
  type FontCatalogEntry,
} from '@/cards/fonts/fontCatalog';
import { ensureBrowserFontsLoaded } from './StudioFontLoader';

interface FontPickerProps {
  label: string;
  role: 'heading' | 'mono';
  value: string;
  onChange: (family: string) => void;
}

export const FontPicker: React.FC<FontPickerProps> = ({ label, role, value, onChange }) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const curatedList = role === 'mono' ? CURATED_MONO_FONTS : CURATED_HEADING_FONTS;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remoteFonts, setRemoteFonts] = useState<FontCatalogEntry[] | null>(null);
  const [totalCatalogSize, setTotalCatalogSize] = useState<number | null>(null);
  const [catalogSource, setCatalogSource] = useState<'fontsource' | 'curated-fallback' | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Local instant filter while remote API loads or when offline
  const displayedFonts = useMemo(() => {
    if (remoteFonts !== null) {
      return remoteFonts;
    }
    return filterFontCatalog(curatedList, { role, query, limit: 40 });
  }, [remoteFonts, curatedList, role, query]);

  const activeFontMeta = useMemo(() => {
    const lower = value.trim().toLowerCase();
    return (
      displayedFonts.find((f) => f.family.toLowerCase() === lower) ??
      curatedList.find((f) => f.family.toLowerCase() === lower)
    );
  }, [displayedFonts, curatedList, value]);

  const closePicker = (restoreTriggerFocus = false) => {
    setIsOpen(false);
    setQuery('');
    setRemoteFonts(null);
    setActiveIndex(0);
    if (restoreTriggerFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
        setRemoteFonts(null);
        setActiveIndex(0);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  // Focus search input when opening
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [isOpen]);

  // Debounced fetch against /api/fonts when dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const params = new URLSearchParams({
          role,
          limit: '40',
        });
        if (query.trim()) {
          params.set('q', query.trim());
        }

        const res = await fetch(`/api/fonts?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;

        const data = (await res.json()) as {
          fonts?: FontCatalogEntry[];
          totalCatalogSize?: number;
          source?: 'fontsource' | 'curated-fallback';
        };

        if (Array.isArray(data.fonts)) {
          setRemoteFonts(data.fonts);
          setActiveIndex(0);
        }
        if (typeof data.totalCatalogSize === 'number') {
          setTotalCatalogSize(data.totalCatalogSize);
        }
        if (data.source) {
          setCatalogSource(data.source);
        }
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          setRemoteFonts(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 140);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [isOpen, query, role]);

  // Load lightweight specimen @font-face rules for top visible items in the open dropdown
  useEffect(() => {
    if (!isOpen || displayedFonts.length === 0) return;
    ensureBrowserFontsLoaded(displayedFonts.slice(0, 16), true);
  }, [isOpen, displayedFonts]);

  // Keep keyboard-selected option scrolled into view
  useEffect(() => {
    if (!isOpen) return;
    const activeEntry = displayedFonts[activeIndex];
    if (!activeEntry) return;
    const el = document.getElementById(`${listboxId}-opt-${activeEntry.id}`);
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [isOpen, activeIndex, displayedFonts, listboxId]);

  const handleSelect = (entry: FontCatalogEntry) => {
    ensureBrowserFontsLoaded([entry], false);
    onChange(entry.family);
    closePicker(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closePicker(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        displayedFonts.length > 0 ? (prev + 1) % displayedFonts.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        displayedFonts.length > 0 ? (prev - 1 + displayedFonts.length) % displayedFonts.length : 0
      );
    } else if (e.key === 'Enter' && displayedFonts[activeIndex]) {
      e.preventDefault();
      handleSelect(displayedFonts[activeIndex]);
    }
  };

  const fallbackStack = role === 'mono' ? 'monospace' : 'sans-serif';

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between">
        <label htmlFor={`${listboxId}-trigger`} className="text-xs font-medium text-zinc-300">
          {label}
        </label>
        {activeFontMeta?.bundled ? (
          <span className="text-[10px] font-mono text-emerald-400/90">Bundled local</span>
        ) : (
          <span className="text-[10px] font-mono text-blue-400/90">Auto-loaded API</span>
        )}
      </div>

      <button
        ref={triggerRef}
        id={`${listboxId}-trigger`}
        type="button"
        data-testid={`font-picker-trigger-${role}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => {
          if (isOpen) {
            closePicker();
          } else {
            setIsOpen(true);
          }
        }}
        className={`w-full h-10 px-3 rounded-xl bg-zinc-900 border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
          isOpen
            ? 'border-blue-500 ring-1 ring-blue-500/30'
            : 'border-zinc-800 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-sm text-zinc-100 truncate font-specimen"
            style={{ fontFamily: `'${value}', ${fallbackStack}` }}
          >
            {value}
          </span>
          {activeFontMeta?.badge && (
            <span className="shrink-0 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400">
              {activeFontMeta.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          data-testid={`font-picker-popover-${role}`}
          className="z-40 mt-0.5 w-full rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Search Bar */}
          <div className="p-2 border-b border-zinc-800/80 flex items-center gap-2 bg-zinc-900/60">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              role="combobox"
              aria-label={`Search ${label} fonts`}
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                displayedFonts[activeIndex]
                  ? `${listboxId}-opt-${displayedFonts[activeIndex].id}`
                  : undefined
              }
              data-testid={`font-picker-search-${role}`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setRemoteFonts(null);
                setActiveIndex(0);
              }}
              placeholder={
                role === 'mono' ? 'Search monospace fonts...' : 'Search 1,600+ open-source fonts...'
              }
              className="flex-1 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
            ) : query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  setRemoteFonts(null);
                  setActiveIndex(0);
                  searchInputRef.current?.focus();
                }}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Options List */}
          <div
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5"
          >
            {displayedFonts.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-zinc-500">
                No matching open-source fonts found for &ldquo;{query}&rdquo;.
              </div>
            ) : (
              displayedFonts.map((entry, idx) => {
                const isSelected = entry.family.toLowerCase() === value.trim().toLowerCase();
                const isActive = idx === activeIndex;

                return (
                  <button
                    key={entry.id}
                    id={`${listboxId}-opt-${entry.id}`}
                    type="button"
                    tabIndex={-1}
                    role="option"
                    aria-selected={isSelected}
                    data-testid={`font-option-${entry.id}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(entry)}
                    className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30'
                        : isActive
                          ? 'bg-zinc-900 text-zinc-100'
                          : 'text-zinc-300 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-sm truncate font-specimen"
                        style={{ fontFamily: `'${entry.family}', ${fallbackStack}` }}
                      >
                        {entry.family}
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                        <span>{entry.category}</span>
                        <span>·</span>
                        <span>{entry.weights.length} weights</span>
                        {entry.badge ? (
                          <>
                            <span>·</span>
                            <span className="text-zinc-400">{entry.badge}</span>
                          </>
                        ) : null}
                      </span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Catalog Status Footer */}
          <div className="px-2.5 py-1.5 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-zinc-400" />
              {catalogSource === 'fontsource' && totalCatalogSize
                ? `Fontsource API (${totalCatalogSize.toLocaleString()} families)`
                : 'Curated open-source presets'}
            </span>
            <span className="font-mono">TTF/WOFF2 synced</span>
          </div>
        </div>
      )}
    </div>
  );
};
