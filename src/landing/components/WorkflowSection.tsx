'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Braces,
  Check,
  Code2,
  Copy,
  ExternalLink,
  FileCode2,
  Link2,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';

type SnippetTab = 'url' | 'markdown' | 'html' | 'meta';

const SAMPLE_REPO = 'shadcn/ui';

const SNIPPETS: Record<SnippetTab, string> = {
  url: `https://gitframe.dev/${SAMPLE_REPO}`,
  markdown: `[![shadcn/ui](https://gitframe.dev/api/card/${SAMPLE_REPO}.png)](https://gitframe.dev/${SAMPLE_REPO}?ref=readme)`,
  html: `<a href="https://gitframe.dev/${SAMPLE_REPO}?ref=readme">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://gitframe.dev/api/card/${SAMPLE_REPO}.png?theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://gitframe.dev/api/card/${SAMPLE_REPO}.png?theme=light" />
    <img src="https://gitframe.dev/api/card/${SAMPLE_REPO}.png" alt="shadcn/ui preview" width="100%" />
  </picture>
</a>`,
  meta: `<meta property="og:image" content="https://gitframe.dev/api/card/${SAMPLE_REPO}.png" />
<meta property="og:image:width" content="1280" />
<meta property="og:image:height" content="640" />
<meta name="twitter:card" content="summary_large_image" />`,
};

const TABS: Array<{
  id: SnippetTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'url', label: 'URL shortcut', icon: Link2 },
  { id: 'markdown', label: 'Markdown', icon: Code2 },
  { id: 'html', label: 'HTML', icon: FileCode2 },
  { id: 'meta', label: 'Meta tags', icon: Braces },
];

const POINTS = [
  {
    icon: Zap,
    title: 'Swap the domain',
    description:
      'Replace github.com with gitframe.dev to open any public repository in the studio.',
  },
  {
    icon: ShieldCheck,
    title: 'No OAuth required',
    description:
      'Cards read public GitHub GraphQL metadata. No tokens, cookies, or account needed.',
  },
  {
    icon: Terminal,
    title: 'One endpoint, every format',
    description: 'Serve PNG or SVG with theme, template, accent, and scale query parameters.',
  },
];

export const WorkflowSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SnippetTab>('url');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPETS[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="workflow" className="relative border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16 lg:px-8">
        <div className="reveal min-w-0">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            One URL. Every surface.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Use the shortcut while browsing GitHub, or embed the live card in a README, docs page,
            or Open Graph tag. The endpoint stays in sync with the repository.
          </p>

          <ul className="mt-8 space-y-5">
            {POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <li key={point.title} className="flex gap-3.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{point.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {point.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href={`/${SAMPLE_REPO}`}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition-colors duration-200 hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none"
          >
            Try the URL shortcut
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="reveal min-w-0">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/30">
            <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 bg-zinc-950/80 p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none ${
                      isActive
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-5">
              {activeTab === 'url' ? (
                <div>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-700/80 bg-zinc-950 px-4 py-3 font-mono text-sm shadow-inner">
                    <Terminal className="h-4 w-4 shrink-0 text-zinc-500" />
                    <span className="truncate">
                      <span className="font-semibold text-blue-400">gitframe.dev/</span>
                      <span className="text-zinc-200">{SAMPLE_REPO}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                    Paste any repository path after the domain. The studio loads its metadata and
                    opens the editor with the card ready to export.
                  </p>
                </div>
              ) : (
                <pre className="font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap text-zinc-300 sm:text-xs">
                  <code>{SNIPPETS[activeTab]}</code>
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/60 px-4 py-3">
              <span className="font-mono text-[10px] text-zinc-500">
                PNG · SVG · ?theme=dark|light
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition-colors duration-200 hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
                <Link
                  href={`/${SAMPLE_REPO}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors duration-200 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:outline-none"
                >
                  Open
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
