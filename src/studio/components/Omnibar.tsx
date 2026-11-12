'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, ChevronRight, Star } from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import { parseGitHubInput } from '@/core/domain/parser';
import type { RepoAutocompleteItem } from '@/core/services/GitHubService';

export const Omnibar: React.FC = () => {
  const { setRepo, setIsFetchingRepo, isFetchingRepo, setFetchError } = useCardStore();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<RepoAutocompleteItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to focus Omnibar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search for suggestions when user types owner
  useEffect(() => {
    const trimmed = inputValue.trim();
    const parsed = parseGitHubInput(trimmed);
    if (!trimmed || parsed.type !== 'owner') {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const res = await fetch(`/api/github/repos?owner=${encodeURIComponent(parsed.owner)}`);
        if (res.ok) {
          const data: RepoAutocompleteItem[] = await res.json();
          setSuggestions(data);
          setIsDropdownOpen(data.length > 0);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const loadRepository = async (inputStr: string) => {
    const parsed = parseGitHubInput(inputStr);
    if (parsed.type === 'invalid') {
      setFetchError(parsed.error);
      return;
    }

    if (parsed.type === 'owner') {
      setIsDropdownOpen(true);
      return;
    }

    setIsFetchingRepo(true, `${parsed.owner}/${parsed.repo}`);
    setFetchError(null);
    setIsDropdownOpen(false);

    try {
      const res = await fetch(`/api/github/repo?owner=${parsed.owner}&repo=${parsed.repo}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Repository '${parsed.owner}/${parsed.repo}' could not be loaded.`
        );
      }

      const repoData = await res.json();
      setRepo(repoData, true);
      setInputValue(`${parsed.owner}/${parsed.repo}`);

      // Smoothly update URL to viral path
      window.history.pushState(null, '', `/${parsed.owner}/${parsed.repo}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch repository';
      setFetchError(msg);
    } finally {
      setIsFetchingRepo(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    loadRepository(inputValue);
  };

  const handleSelectSuggestion = (repoName: string) => {
    const parsed = parseGitHubInput(inputValue.trim());
    if (parsed.type === 'owner') {
      loadRepository(`${parsed.owner}/${repoName}`);
    }
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (!val.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
          {isFetchingRepo ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search any repository (e.g. vercel/next.js or URL)..."
          aria-label="Search GitHub repository"
          className="w-full h-10 pl-10 pr-24 rounded-full bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all shadow-inner"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setSuggestions([]);
                setIsDropdownOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear repository search"
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded">
            /
          </kbd>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute top-12 left-0 right-0 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 tracking-wider uppercase flex items-center justify-between border-b border-zinc-800/60 mb-1">
            <span>Public Repositories</span>
            {isSearchingSuggestions && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleSelectSuggestion(item.name)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-zinc-800/60 text-left transition-colors group"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                      {item.name}
                    </span>
                    {item.primaryLanguage && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.primaryLanguage.color }}
                        />
                        {item.primaryLanguage.name}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5 max-w-md">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-zinc-400 shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-mono">
                    <Star className="w-3.5 h-3.5 text-zinc-500" />
                    {item.stars}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
