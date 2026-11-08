'use client';

import React, { useState } from 'react';
import { Copy, Check, Code2, Sparkles } from 'lucide-react';

export const ReadmeApiSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'picture' | 'opengraph'>('markdown');
  const [copied, setCopied] = useState(false);

  const snippets = {
    markdown: `[![Gitframe](https://gitframe.dev/api/card/sandovaldavid/gitframe.png)](https://gitframe.dev/sandovaldavid/gitframe)`,
    picture: `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://gitframe.dev/api/card/sandovaldavid/gitframe.png?theme=dark">
  <source media="(prefers-color-scheme: light)" srcset="https://gitframe.dev/api/card/sandovaldavid/gitframe.png?theme=light">
  <img alt="Social Card Preview" src="https://gitframe.dev/api/card/sandovaldavid/gitframe.png">
</picture>`,
    opengraph: `<meta property="og:title" content="gitframe" />
<meta property="og:description" content="Instant GitHub Social Preview generator" />
<meta property="og:image" content="https://gitframe.dev/api/card/sandovaldavid/gitframe.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://gitframe.dev/api/card/sandovaldavid/gitframe.png" />`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="dynamic-api" className="py-20 md:py-28 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>Dynamic Image Endpoint</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Embed Live in your README or Docs
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Never manually re-upload an image when your star count, release version, or description
            changes. The dynamic endpoint serves CDN-cached SVG and PNG cards on demand.
          </p>
        </div>

        {/* Code Snippet Box */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Markdown (README)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('picture')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'picture'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                HTML &lt;picture&gt; (Dark/Light)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('opengraph')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'opengraph'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Website Meta Tags
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Code area */}
          <div className="p-5 overflow-x-auto font-mono text-xs text-zinc-300 leading-relaxed bg-[#0d1117]">
            <pre>
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>
        </div>

        {/* Benefits list */}
        <div className="max-w-2xl mx-auto mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Anti-SSRF IP Sanitization</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>CDN 24h Edge Cache + SWR</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Fallback SVG on Rate Limits</span>
          </div>
        </div>
      </div>
    </section>
  );
};
