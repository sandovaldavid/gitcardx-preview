'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Terminal, ExternalLink, Zap } from 'lucide-react';

export const UrlTrickSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const sampleUrl = 'gitframe.dev/shadcn/ui';

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${sampleUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="url-trick" className="py-20 md:py-28 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-b from-blue-950/30 via-zinc-900/60 to-zinc-950 border border-blue-500/20 p-8 md:p-14 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>Developer Speed Hack</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              The <code className="text-blue-400 font-mono">gitframe.dev</code> URL shortcut.
            </h2>

            <p className="mt-4 text-base text-zinc-300 leading-relaxed">
              Whenever you are browsing any repository on GitHub, replace{' '}
              <span className="font-mono text-zinc-400">github.com</span> with{' '}
              <span className="font-mono text-blue-400 font-semibold">gitframe.dev</span> (swap{' '}
              <span className="text-zinc-200 font-semibold font-mono">hub</span> with{' '}
              <span className="text-blue-400 font-semibold font-mono">frame</span>) in your address
              bar to immediately launch the studio with all metadata preloaded.
            </p>

            {/* Simulated Browser Address Bar */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 flex items-center bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-3 font-mono text-sm shadow-inner group">
                <Terminal className="w-4 h-4 text-zinc-500 mr-3 shrink-0" />
                <span className="text-blue-400 font-semibold">gitframe.dev/</span>
                <span className="text-zinc-200">shadcn/ui</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-white text-xs font-semibold border border-zinc-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <Link
                  href="/shadcn/ui"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <span>Try It Live</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div>
                <span className="font-semibold text-white block mb-1">1. Serverless Streaming</span>
                Loads in milliseconds using Next.js 16 Partial Prerendering.
              </div>
              <div>
                <span className="font-semibold text-white block mb-1">2. Zero Permissions</span>
                Uses public GitHub GraphQL queries. No OAuth grants required.
              </div>
              <div>
                <span className="font-semibold text-white block mb-1">
                  3. Instant Customization
                </span>
                Tweak fonts, backgrounds, metrics, and export in 1 click.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
