'use client';

import React from 'react';
import { Bookmark, Download, Palette, Share2, ShieldCheck } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Stateless by design',
    description:
      'No accounts, no database, and no mandatory cookies. Your card configuration lives in the URL and your browser, so there is nothing to sign up for.',
    span: 'md:col-span-2',
    accent: 'from-blue-500/15 via-indigo-500/10 to-transparent',
  },
  {
    icon: Bookmark,
    title: 'Local brand kits',
    description:
      'Save up to 10 palettes, typography sets, and backgrounds in IndexedDB. Import and export the whole kit as JSON.',
    span: '',
    accent: '',
  },
  {
    icon: Share2,
    title: 'Social simulator',
    description:
      'See the real card inside X, LinkedIn, Discord, Slack, and GitHub feed layouts, in light and dark mode.',
    span: '',
    accent: '',
  },
  {
    icon: Palette,
    title: 'WCAG contrast engine',
    description:
      'Palettes derive from the repository language color and are checked for readable contrast before export.',
    span: '',
    accent: '',
  },
  {
    icon: Download,
    title: 'Export anywhere',
    description:
      'Download PNG at 1x or 2x, vector SVG, or embed the live README endpoint that keeps itself in sync.',
    span: '',
    accent: '',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal max-w-2xl">
          <p className="font-mono text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Built for the whole workflow.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Everything around the card is designed to stay out of your way: local state, public
            metadata, real previews, and exports that work where you already publish.
          </p>
        </div>

        <div className="reveal mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-[border-color,background-color] duration-300 ease-out hover:border-zinc-700 hover:bg-zinc-900/70 ${feature.span}`}
              >
                {feature.accent && (
                  <div
                    className={`pointer-events-none absolute inset-0 bg-linear-to-br ${feature.accent}`}
                  />
                )}
                <div className="relative">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-400 sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
