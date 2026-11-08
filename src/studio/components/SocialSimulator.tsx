'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useCardStore } from '../state/useCardStore';
import { CardRenderer } from '@/cards/templates/CardTemplateRegistry';
import type { RepoMetadata, CardConfig } from '@/core/domain/schemas';

export type SimulatorPlatform = 'twitter' | 'linkedin' | 'discord' | 'slack' | 'github';

interface SimulatorCardPreviewProps {
  repo: RepoMetadata;
  config: CardConfig;
  className?: string;
  maxWidth?: number;
}

/**
 * Responsive card embed container that dynamically measures its client width
 * and scales the 1280x640 Satori card to fit 100% with exact 2:1 aspect ratio.
 * Completely eliminates horizontal overflow across all social feeds.
 */
const SimulatorCardPreview: React.FC<SimulatorCardPreviewProps> = ({
  repo,
  config,
  className = '',
  maxWidth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.38);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(w / 1280);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full relative overflow-hidden aspect-[2/1] ${className}`}
      style={{
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
      }}
    >
      <div
        style={{
          width: 1280,
          height: 640,
          transform: `scale(${scale}) translateZ(0)`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'geometricPrecision',
        }}
      >
        <CardRenderer repo={repo} config={config} />
      </div>
    </div>
  );
};

export const SocialSimulator: React.FC = () => {
  const { repo, config } = useCardStore();
  const [platform, setPlatform] = useState<SimulatorPlatform>('twitter');
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4 sm:p-6 overflow-y-auto">
      {/* Platform & Theme Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-2xl px-4 py-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md">
        {/* Platform Selector */}
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: 'twitter', label: 'X (Twitter)' },
              { id: 'linkedin', label: 'LinkedIn' },
              { id: 'discord', label: 'Discord' },
              { id: 'slack', label: 'Slack' },
              { id: 'github', label: 'GitHub Feed' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                platform === p.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Dark / Light Mode Switcher */}
        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setIsDark(false)}
            title="Light Mode Simulation"
            className={`p-1.5 rounded transition-colors ${
              !isDark ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsDark(true)}
            title="Dark Mode Simulation"
            className={`p-1.5 rounded transition-colors ${
              isDark ? 'bg-zinc-800 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SIMULATOR MOCKUP CONTAINER */}
      <div className="w-full max-w-2xl flex justify-center animate-in fade-in duration-200">
        {/* PLATFORM 1: X (TWITTER) */}
        {platform === 'twitter' && (
          <div
            className={`w-full max-w-xl rounded-2xl border p-4 sm:p-5 font-sans shadow-2xl transition-colors ${
              isDark
                ? 'bg-black border-zinc-800 text-zinc-100'
                : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            {/* Tweet Author Header */}
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={repo.owner.avatarUrl}
                alt={repo.owner.login}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span
                    className={`font-bold text-sm truncate ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {repo.owner.login}
                  </span>
                  <span
                    className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                  >
                    @{repo.owner.login} · 2h
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm leading-normal ${
                    isDark ? 'text-zinc-100' : 'text-zinc-800'
                  }`}
                >
                  Just dropped a major update to{' '}
                  <strong className={isDark ? 'text-white font-bold' : 'text-zinc-950 font-bold'}>
                    {repo.name}
                  </strong>
                  ! Check out the social preview card below and let us know your thoughts 🚀
                </p>

                {/* Twitter Large Image Card */}
                <div
                  className={`mt-3 rounded-2xl overflow-hidden border transition-colors ${
                    isDark
                      ? 'border-zinc-800 bg-[#16181c] hover:bg-[#1e2126]'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100/80'
                  }`}
                >
                  {/* Responsive Card Embed */}
                  <SimulatorCardPreview repo={repo} config={config} />

                  {/* Card Bottom Meta */}
                  <div className="p-3 flex flex-col gap-0.5">
                    <span
                      className={`text-[11px] uppercase font-mono font-medium ${
                        isDark ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                    >
                      gitcardx.dev
                    </span>
                    <span
                      className={`text-sm font-semibold truncate leading-tight ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {config.title || repo.name}
                    </span>
                    <p
                      className={`text-xs line-clamp-1 ${
                        isDark ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {config.tagline || repo.description}
                    </p>
                  </div>
                </div>

                {/* Tweet Action Icons */}
                <div
                  className={`mt-3 flex items-center justify-between text-xs px-2 ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                    <MessageCircle className="w-4 h-4" />
                    <span>24</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer">
                    <Repeat2 className="w-4 h-4" />
                    <span>18</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-pink-500 cursor-pointer">
                    <Heart className="w-4 h-4" />
                    <span>142</span>
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                    <Share className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM 2: LINKEDIN */}
        {platform === 'linkedin' && (
          <div
            className={`w-full max-w-xl rounded-xl border p-4 sm:p-5 font-sans shadow-2xl transition-colors ${
              isDark
                ? 'bg-[#1b1f23] border-[#30363d] text-zinc-100'
                : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            {/* Author Header */}
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={repo.owner.avatarUrl}
                alt={repo.owner.login}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span
                  className={`font-semibold text-sm leading-tight truncate ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  {repo.owner.login}
                </span>
                <span className={`text-xs truncate ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  Full Stack Engineer & Open Source Builder · 1h · 🌐
                </span>
              </div>
            </div>

            <p
              className={`text-sm mb-3 leading-normal ${
                isDark ? 'text-zinc-100' : 'text-zinc-800'
              }`}
            >
              Excited to announce the new visual identity for{' '}
              <strong className={isDark ? 'text-white font-bold' : 'text-zinc-950 font-bold'}>
                {repo.name}
              </strong>
              . Built for developers seeking clean architecture and fast delivery.
            </p>

            {/* LinkedIn Preview Banner */}
            <div
              className={`rounded-lg overflow-hidden border ${
                isDark ? 'border-zinc-700/80 bg-[#12161a]' : 'border-zinc-200 bg-zinc-50'
              }`}
            >
              {/* Responsive Card Embed */}
              <SimulatorCardPreview repo={repo} config={config} />

              <div className="p-3">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  gitcardx.dev
                </span>
                <h4
                  className={`font-bold text-sm truncate mt-0.5 ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  {config.title || repo.name}
                </h4>
                <p
                  className={`text-xs line-clamp-1 mt-0.5 ${
                    isDark ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {config.tagline || repo.description}
                </p>
              </div>
            </div>

            {/* Reaction Bar */}
            <div
              className={`mt-3 pt-2 border-t flex items-center justify-between text-xs font-semibold ${
                isDark ? 'border-zinc-800 text-zinc-300' : 'border-zinc-200 text-zinc-600'
              }`}
            >
              <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                <MessageSquare className="w-4 h-4" />
                <span>Comment</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span>Repost</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                <Send className="w-4 h-4" />
                <span>Send</span>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM 3: DISCORD */}
        {platform === 'discord' && (
          <div
            className={`w-full max-w-xl rounded-xl border p-4 sm:p-5 font-sans shadow-2xl transition-colors ${
              isDark
                ? 'bg-[#313338] border-zinc-700/60 text-zinc-100'
                : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={repo.owner.avatarUrl}
                alt="bot"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#5865f2]">GitHub Bot</span>
                  <span className="bg-[#5865f2] text-white text-[10px] px-1 py-0.5 rounded font-bold uppercase">
                    APP
                  </span>
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Today at 4:20 PM
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 leading-normal ${
                    isDark ? 'text-zinc-200' : 'text-zinc-700'
                  }`}
                >
                  New star milestone reached on repository!
                </p>

                {/* Discord Embed Box */}
                <div
                  className={`mt-2.5 rounded-lg p-3.5 border-l-4 flex flex-col gap-2 max-w-[440px] w-full ${
                    isDark ? 'bg-[#2b2d31]' : 'bg-[#f2f3f5] border border-zinc-200/60'
                  }`}
                  style={{ borderLeftColor: config.palette.accent }}
                >
                  <span
                    className={`text-[11px] font-semibold ${
                      isDark ? 'text-zinc-300' : 'text-zinc-600'
                    }`}
                  >
                    GitHub Repository
                  </span>
                  <a
                    href={`https://github.com/${repo.owner.login}/${repo.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`font-bold text-sm hover:underline flex items-center gap-1 truncate ${
                      isDark ? 'text-[#58a6ff]' : 'text-blue-600'
                    }`}
                  >
                    <span className="truncate">
                      {repo.owner.login}/{repo.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isDark ? 'text-zinc-200' : 'text-zinc-700'
                    }`}
                  >
                    {config.tagline || repo.description}
                  </p>

                  {/* Embed Image */}
                  <div className="rounded-lg overflow-hidden border border-black/20 mt-1">
                    <SimulatorCardPreview repo={repo} config={config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM 4: SLACK */}
        {platform === 'slack' && (
          <div
            className={`w-full max-w-xl rounded-xl border p-4 sm:p-5 font-sans shadow-2xl transition-colors ${
              isDark
                ? 'bg-[#1a1d21] border-zinc-700/60 text-zinc-100'
                : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={repo.owner.avatarUrl}
                alt="bot"
                width={36}
                height={36}
                className="w-9 h-9 rounded object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    GitHub
                  </span>
                  <span
                    className={`text-[10px] px-1 rounded uppercase font-semibold ${
                      isDark
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-300'
                    }`}
                  >
                    APP
                  </span>
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    9:41 AM
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 leading-normal ${
                    isDark ? 'text-zinc-200' : 'text-zinc-700'
                  }`}
                >
                  Repo preview for{' '}
                  <code
                    className={`px-1 py-0.5 rounded font-mono ${
                      isDark
                        ? 'text-blue-300 bg-blue-950/80 border border-blue-900/60'
                        : 'text-blue-700 bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {repo.name}
                  </code>
                  :
                </p>

                {/* Slack Attachment */}
                <div
                  className="mt-2 pl-3 border-l-4 flex flex-col gap-1.5 max-w-[420px] w-full"
                  style={{ borderLeftColor: config.palette.accent }}
                >
                  <span
                    className={`font-bold text-sm hover:underline cursor-pointer truncate ${
                      isDark ? 'text-[#1d9bd1]' : 'text-blue-600'
                    }`}
                  >
                    {config.title || repo.name}
                  </span>
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isDark ? 'text-zinc-200' : 'text-zinc-700'
                    }`}
                  >
                    {config.tagline || repo.description}
                  </p>

                  <div
                    className={`rounded-lg overflow-hidden border mt-1 ${
                      isDark ? 'border-zinc-700/80' : 'border-zinc-200'
                    }`}
                  >
                    <SimulatorCardPreview repo={repo} config={config} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLATFORM 5: GITHUB FEED */}
        {platform === 'github' && (
          <div
            className={`w-full max-w-xl rounded-xl border p-4 sm:p-5 font-sans shadow-2xl transition-colors ${
              isDark
                ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]'
                : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <div
              className={`flex items-center gap-2 mb-3 text-xs ${
                isDark ? 'text-zinc-300 font-medium' : 'text-zinc-700 font-medium'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Starred repository by community</span>
            </div>

            <div
              className={`rounded-xl border p-4 flex flex-col gap-3 w-full ${
                isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-zinc-50 border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-sm font-semibold hover:underline cursor-pointer truncate ${
                      isDark ? 'text-[#58a6ff]' : 'text-blue-600'
                    }`}
                  >
                    {repo.owner.login} / {repo.name}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium shrink-0 ${
                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>{repo.stars}</span>
                </div>
              </div>

              <p
                className={`text-xs line-clamp-2 leading-relaxed ${
                  isDark ? 'text-zinc-200' : 'text-zinc-700'
                }`}
              >
                {config.tagline || repo.description}
              </p>

              {/* Card Banner Preview */}
              <div
                className={`rounded-lg overflow-hidden border ${
                  isDark ? 'border-[#30363d]' : 'border-zinc-200'
                }`}
              >
                <SimulatorCardPreview repo={repo} config={config} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
