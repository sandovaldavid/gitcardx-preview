'use client';

import React from 'react';
import { Database, ShieldCheck, Share2, Palette, Cpu, Download, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Database,
    title: 'Zero Database & Zero Sign-Up',
    description:
      'Stateless architecture with no mandatory accounts, sessions, or backend databases. Open the studio, craft your card, and export immediately.',
  },
  {
    icon: ShieldCheck,
    title: 'Local Brand Kit Vault (IndexedDB)',
    description:
      'Save and switch between up to 10 custom brand kits entirely on client-side IndexedDB. Export and import JSON configs with zero server telemetry.',
  },
  {
    icon: Share2,
    title: 'Multi-Platform Social Simulator',
    description:
      'Live photo-realistic preview for X (Twitter), LinkedIn, Discord, Slack, and GitHub Feed in dark and light modes with reactive scaling.',
  },
  {
    icon: Palette,
    title: 'WCAG AAA Contrast Engine',
    description:
      'Colord-powered color algorithm extracts official GitHub language colors and guarantees readable contrast across badges, titles, and backgrounds.',
  },
  {
    icon: Cpu,
    title: '6 Procedural Generative Backgrounds',
    description:
      'Mathematically rendered SVG patterns including Architectural Grid, Dot Matrix, Radial Spotlight, Aurora Mesh, and Topographic Contours.',
  },
  {
    icon: Download,
    title: 'Retina 2x & Dynamic API Exports',
    description:
      'Download 1280×640 standard, 2560×1280 @2x high-density PNG, vector SVG, or embed the live auto-updating dynamic endpoint in your README.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer-First Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Everything You Need, Nothing You Don&apos;t
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Engineered with modern web standards, strict privacy boundaries, and zero fixed server
            overhead.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-8 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
